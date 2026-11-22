# Day 1: Modern AI & Agentic Engineering

As a modern full-stack developer, companies expect you to build AI-powered features: automated triage, intelligent search, agentic data extractors, and generative workflows.

---

## 1. How LLMs Process Text: The Token Layer

Large Language Models (like GPT-4, Claude 3.5, or Gemini) do not see strings or words. They see **Tokens** generated via **Byte-Pair Encoding (BPE)**.

```
"Full-Stack Software Engineer"
             │
             ▼ (Tokenizer)
[ "Full", "-Stack", " Software", " Engineer" ]
             │
             ▼
[ 15432,   24881,     9132,        18341 ]  (Array of 32-bit token IDs)
```

### The Math of Tokens:
* **Rule of Thumb**: In English text, **1 token $\approx$ 4 characters** or $\approx 0.75$ words.
* 100 tokens $\approx$ 75 English words.
* **Cost & Latency Asymmetry**:
  * **Input Tokens (Prompt)**: Processed in parallel by the GPU. Cheap and fast.
  * **Output Tokens (Generation)**: Generated **auto-regressively** (one token at a time). The model predicts token 1, feeds it back into its context, predicts token 2, and so on. Output tokens take $3\times \text{ to } 5\times$ more time and cost significantly more.

---

## 2. Core Hyperparameters: Controlling the LLM

```typescript
const requestConfig = {
  temperature: 0.1,    // Controls randomness / entropy (0.0 = deterministic)
  topP: 0.95,          // Nucleus sampling
  maxOutputTokens: 2048,
};
```

### 1. Temperature ($0.0 \text{ to } 2.0$)
* **`temperature = 0.0` (Greedy Decoding)**: The model always selects the token with the highest mathematical probability.
  * **Use for**: Code generation, JSON data extraction, mathematics, API tool-calling.
* **`temperature = 0.7 - 1.0`**: The probability distribution is softened. The model considers less probable, creative alternatives.
  * **Use for**: Brainstorming, conversational agents, creative copywriting.

### 2. Context Window
The maximum number of tokens a model can hold in memory at any single time (e.g. 128k tokens for GPT-4o, 1M+ tokens for Gemini 1.5).
* Everything the model knows about your current conversation—including system instructions, document snippets, and past chat history—must fit inside this window.

---

## 3. The Prompt Hierarchy

Modern models are trained to follow a strict role hierarchy:

```
┌────────────────────────────────────────────────────────┐
│ SYSTEM PROMPT (Guardrails, Constraints, Schema)        │
├────────────────────────────────────────────────────────┤
│ USER PROMPT (Dynamic runtime input from the end user)  │
├────────────────────────────────────────────────────────┤
│ ASSISTANT MESSAGE (Model's response or historical turn)│
└────────────────────────────────────────────────────────┘
```

* **System Prompt**: Injected by your backend. The end-user should never overwrite this. It sets the behavior, personality, output constraints, and security limits.
* **User Prompt**: The untrusted input supplied by the user.

---

## 4. Production Structured Outputs with Schema Validation

Never ask an LLM to "return JSON" without enforcing a strict schema. The model might return Markdown formatting (````json ... ````) or omit required fields, crashing your backend parser.

### Production Solution: Schema-Enforced JSON Extraction
Here is a complete, production-grade Node.js service using Zod and native `fetch`:

```typescript
import { z } from 'zod';

// Step 1: Define your strongly typed contract with Zod
export const CandidateEvaluationSchema = z.object({
  candidateName: z.string(),
  yearsOfExperience: z.number().nullable(),
  primarySkills: z.array(z.string()),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'NO_HIRE']),
  rationale: z.string().min(10),
});

export type CandidateEvaluation = z.infer<typeof CandidateEvaluationSchema>;

// Step 2: Extract structured data from raw unstructured text
export async function evaluateResumeText(
  rawResumeText: string,
  apiKey: string
): Promise<CandidateEvaluation> {
  const systemInstruction = `
You are an expert technical hiring analyzer.
Analyze the candidate profile and extract the data strictly according to this JSON schema:
{
  "candidateName": string,
  "yearsOfExperience": number | null,
  "primarySkills": string[],
  "recommendation": "STRONG_HIRE" | "HIRE" | "NO_HIRE",
  "rationale": string
}
OUTPUT ONLY VALID RFC-8259 JSON. NO PREAMBLE. NO MARKDOWN TICKS.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nCandidate Profile:\n"${rawResumeText}"` }],
          },
        ],
        generationConfig: {
          temperature: 0.0, // Absolute determinism
          responseMimeType: 'application/json', // Forces API to return pure JSON
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`LLM API failed with HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('LLM generated an empty response');
  }

  // Parse and validate with Zod
  const parsedJson = JSON.parse(rawText);
  const validatedData = CandidateEvaluationSchema.parse(parsedJson);

  return validatedData;
}
```
