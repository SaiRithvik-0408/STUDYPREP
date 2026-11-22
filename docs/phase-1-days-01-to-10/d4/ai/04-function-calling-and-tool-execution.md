# Day 4: Modern AI & Function Calling (Tool Use Architecture)

LLMs alone are isolated: they cannot query your PostgreSQL database, fetch real-time weather, or execute calculations. **Function Calling (Tool Use)** transforms an LLM from a simple text predictor into an **Autonomous Agent** that can execute real backend code.

---

## 1. The 4-Step Function Calling Architecture

```
1. Client Request + Tool Declarations (JSON Schema)
   User: "What is the order status for order #8492?"
   Tools: [{ name: "getOrderDetails", parameters: { orderId: "number" } }]
                    │
                    ▼
2. LLM Evaluates & Generates Tool Call Request
   LLM: "I need to call getOrderDetails({ orderId: 8492 })"
                    │
                    ▼
3. Your Backend Executes the Real Function
   const result = await db.orders.findUnique({ where: { id: 8492 } });
   // result: { id: 8492, status: "SHIPPED", trackingNumber: "TRK123" }
                    │
                    ▼
4. Send Function Result Back to LLM Context
   Backend: "Tool response: { status: 'SHIPPED', trackingNumber: 'TRK123' }"
                    │
                    ▼
5. LLM Formulates Final Response to User
   LLM: "Order #8492 has shipped! Your tracking number is TRK123."
```

> **Key Rule**: The LLM **never executes code directly**. It generates structured JSON arguments instructing *your backend* to execute the function securely.

---

## 2. Complete Production Implementation in TypeScript

```typescript
// Define our local backend database function
async function getOrderDetails(orderId: number) {
  // Simulating database lookup
  const mockDatabase: Record<number, { status: string; item: string; etaDays: number }> = {
    8492: { status: 'SHIPPED', item: 'Mechanical Keyboard', etaDays: 2 },
    5510: { status: 'PROCESSING', item: '4K Monitor', etaDays: 5 },
  };

  return mockDatabase[orderId] || { error: 'Order not found' };
}

// Tool Declaration Schema (OpenAPI / Gemini / OpenAI standard)
const tools = [
  {
    functionDeclarations: [
      {
        name: 'getOrderDetails',
        description: 'Lookup the shipping status and item details for a specific customer order ID',
        parameters: {
          type: 'OBJECT',
          properties: {
            orderId: {
              type: 'NUMBER',
              description: 'The unique numeric order identifier',
            },
          },
          required: ['orderId'],
        },
      },
    ],
  },
];

// Production Agent Dispatcher Loop
export async function runToolCallingAgent(userPrompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Step 1: Initial call with prompt and available tools
  const initialResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      tools: tools,
    }),
  });

  const initialData = await initialResponse.json();
  const candidate = initialData.candidates?.[0]?.content;
  const functionCallPart = candidate?.parts?.find((p: any) => p.functionCall);

  // If the model does not need a tool, return its direct text response
  if (!functionCallPart) {
    return candidate?.parts?.[0]?.text || 'No response generated.';
  }

  // Step 2: The model requested a function call!
  const { name, args } = functionCallPart.functionCall;
  console.log(`[Agent Decision]: Model invoked tool '${name}' with arguments:`, args);

  let functionResult: any;
  if (name === 'getOrderDetails') {
    functionResult = await getOrderDetails(args.orderId);
  } else {
    throw new Error(`Unknown tool requested: ${name}`);
  }

  // Step 3: Send function execution result back into the model's conversation history
  const followUpResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
        candidate, // Include the assistant's tool-call request turn
        {
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: name,
                response: { output: functionResult },
              },
            },
          ],
        },
      ],
      tools: tools,
    }),
  });

  const followUpData = await followUpResponse.json();
  const finalAnswer = followUpData.candidates?.[0]?.content?.parts?.[0]?.text;

  return finalAnswer;
}
```
