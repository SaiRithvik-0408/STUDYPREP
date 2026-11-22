# Day 5: Modern AI & Autonomous Agent Architectures (The ReAct Pattern)

A standard LLM call is single-turn (input $\to$ output). An **Autonomous Agent** is an iterative system that uses an LLM as a reasoning engine inside a feedback loop to accomplish complex multi-step objectives.

---

## 1. The ReAct Architecture (Reasoning + Acting)

The **ReAct Pattern** (Yao et al., 2022) combines internal reasoning with external tool actions:

```
                  ┌─────────────────────────────────────┐
                  │          USER OBJECTIVE             │
                  │ "Find company valuation and stock   │
                  │  price, then compute P/E ratio."    │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     THE AUTONOMOUS AGENT LOOP                          │
 │                                                                        │
 │  1. THOUGHT: "I first need to search for the latest earnings report."  │
 │        │                                                               │
 │        ▼                                                               │
 │  2. ACTION: Call tool `webSearch("Tesla Q3 2024 earnings net income")` │
 │        │                                                               │
 │        ▼                                                               │
 │  3. OBSERVATION: Tool returns `"$2.16 Billion net income"`.            │
 │        │                                                               │
 │        ▼                                                               │
 │  4. THOUGHT: "Now I need the current stock market cap."                │
 │        │                                                               │
 │        ▼                                                               │
 │  5. ACTION: Call tool `getStockPrice("TSLA")`                          │
 │        │                                                               │
 │        ▼                                                               │
 │  6. OBSERVATION: Tool returns `"$750 Billion Market Cap"`.             │
 │        │                                                               │
 │        ▼                                                               │
 │  7. THOUGHT: "I have both values. I can now calculate the P/E ratio."  │
 │        │                                                               │
 │        ▼                                                               │
 │  8. FINAL ANSWER: Returns synthesized calculation to the user.         │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Autonomous Agent Loop in TypeScript

```typescript
interface AgentTool {
  name: string;
  description: string;
  execute: (args: any) => Promise<string>;
}

// Local tools available to the agent
const availableTools: Record<string, AgentTool> = {
  calculate: {
    name: 'calculate',
    description: 'Safely evaluate a mathematical expression',
    execute: async ({ expr }) => String(eval(expr)), // Note: Use mathjs in real production
  },
  searchDatabase: {
    name: 'searchDatabase',
    description: 'Lookup user subscription records by email',
    execute: async ({ email }) => JSON.stringify({ email, plan: 'PRO', status: 'ACTIVE' }),
  },
};

// Autonomous Execution Loop
export async function runAutonomousAgent(
  goal: string,
  apiKey: string,
  maxIterations = 5
): Promise<string> {
  const conversationHistory: any[] = [
    {
      role: 'user',
      parts: [
        {
          text: `
You are an autonomous AI problem-solver.
Your goal is: "${goal}"

You have access to these tools:
- calculate(expr: string)
- searchDatabase(email: string)

At each step, think about what you need to do, call tools if necessary, or output your final answer when done.
`,
        },
      ],
    },
  ];

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`[Agent Step ${iteration}/${maxIterations}] Reasoning...`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: conversationHistory,
          // Inject tool definitions
        }),
      }
    );

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content;
    const textPart = candidate?.parts?.[0]?.text;

    // Check if the model decided it has reached the final answer:
    if (textPart && textPart.includes('FINAL ANSWER:')) {
      return textPart.replace('FINAL ANSWER:', '').trim();
    }

    // Inspect if model requested a tool invocation:
    const functionCallPart = candidate?.parts?.find((p: any) => p.functionCall);
    if (functionCallPart) {
      const { name, args } = functionCallPart.functionCall;
      console.log(`[Executing Tool]: ${name} with args:`, args);

      const tool = availableTools[name];
      if (!tool) throw new Error(`Agent attempted to call nonexistent tool: ${name}`);

      const observation = await tool.execute(args);

      // Append thought and observation back into context
      conversationHistory.push(candidate);
      conversationHistory.push({
        role: 'function',
        parts: [{ functionResponse: { name, response: { output: observation } } }],
      });
    } else {
      // Model returned text without final answer; feed it back to push for completion
      conversationHistory.push(candidate);
      conversationHistory.push({
        role: 'user',
        parts: [{ text: 'Continue working towards the goal or output FINAL ANSWER: [your conclusion]' }],
      });
    }
  }

  throw new Error(`Agent exceeded maximum iteration limit of ${maxIterations} steps without finishing.`);
}
```

---

## 3. Production Safety: Preventing Runaway Agents
1. **Hard Iteration Caps (`maxIterations = 5`)**: Prevents an agent from looping infinitely and burning thousands of dollars in API credits.
2. **Cycle Detection**: Track the history of tool calls. If the agent calls the same tool with the identical arguments 3 times in a row, break the loop immediately.
3. **Execution Timeout**: Enforce an `AbortController` signal (e.g. 30 seconds max) to prevent hanging background processes.
