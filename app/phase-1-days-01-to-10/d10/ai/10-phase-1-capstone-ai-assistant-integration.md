# Day 10: Modern AI & Phase 1 Capstone Assistant Engine

This manuscript details the architecture of an enterprise AI assistant synthesizing **Tool Execution (Function Calling)**, **RAG Semantic Search**, and **Real-Time Streaming UI**.

---

## 1. Unified AI Engine Architecture

```
User Input ("Check my order status #8492 and find return policy for keyboards")
                           │
                           ▼
                  [ AI Orchestrator ]
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    [ Tool: getOrderStatus ]   [ Tool: ragSearchDocs ]
              │                         │
              ▼                         ▼
      Query PostgreSQL          Vector Search (pgvector)
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
         [ Stream Synthesized Response via SSE ]
                           │
                           ▼
               [ Next.js Streaming UI ]
```

---

## 2. Production Capstone Agent Orchestrator

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { InMemoryVectorStore } from '../../d7/ai/07-in-memory-vector-search-engine';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Declaring tools available to the capstone assistant
const assistantTools = [
  {
    functionDeclarations: [
      {
        name: 'searchCompanyKnowledgeBase',
        description: 'Semantic vector search over company return policies, warranties, and FAQs',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'The search query string' },
          },
          required: ['query'],
        },
      },
      {
        name: 'lookupOrder',
        description: 'Lookup the live shipping status and delivery tracking number for an order ID',
        parameters: {
          type: 'OBJECT',
          properties: {
            orderId: { type: 'NUMBER', description: 'The customer order ID' },
          },
          required: ['orderId'],
        },
      },
    ],
  },
];

export async function processAssistantRequest(
  userPrompt: string,
  vectorStore: InMemoryVectorStore
): Promise<ReadableStream> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: assistantTools as any,
  });

  const chat = model.startChat();
  const result = await chat.sendMessage(userPrompt);
  const functionCall = result.response.functionCalls()?.[0];

  // If model needs to execute a tool:
  if (functionCall) {
    const { name, args } = functionCall;
    let toolResult: any;

    if (name === 'searchCompanyKnowledgeBase') {
      // In real app: generate embedding for args.query and search vectorStore
      toolResult = 'Keyboards can be returned within 30 days of delivery with original packaging.';
    } else if (name === 'lookupOrder') {
      toolResult = { orderId: args.orderId, status: 'DELIVERED', carrier: 'FedEx' };
    }

    // Feed tool observation back to model and stream final response
    const followUpStream = await chat.sendMessageStream([
      {
        functionResponse: {
          name: name,
          response: { output: toolResult },
        },
      },
    ]);

    // Return Web API ReadableStream for chunked HTTP delivery
    return new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of followUpStream.stream) {
          controller.enqueue(encoder.encode(chunk.text()));
        }
        controller.close();
      },
    });
  }

  // Model replied directly without tools: stream direct response
  const stream = await model.generateContentStream(userPrompt);
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      for await (const chunk of stream.stream) {
        controller.enqueue(encoder.encode(chunk.text()));
      }
      controller.close();
    },
  });
}
```
