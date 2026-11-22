# Day 2: Modern AI & Prompt Engineering as Code

In production systems, prompt engineering is not about typing casual questions into ChatGPT. It is about building **deterministic, version-controlled prompt templates** that program the model's in-context attention mechanisms.

---

## 1. The 3 Prompt Engineering Paradigms

```
┌────────────────────────────────────────────────────────┐
│ 1. ZERO-SHOT PROMPTING                                 │
│    Direct instruction without demonstrations.          │
│    "Classify the sentiment of this text: [TEXT]"       │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. FEW-SHOT IN-CONTEXT LEARNING                        │
│    Provide 2-3 exemplar pairs to prime the model.      │
│    "Text: 'Loved it' -> Score: 5"                      │
│    "Text: 'Broke instantly' -> Score: 1"               │
│    "Text: [TARGET_TEXT] -> Score: "                    │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. CHAIN-OF-THOUGHT (CoT) REASONING                    │
│    Force the model to verbalize internal reasoning     │
│    steps before outputting the final answer.           │
│    "Think step-by-step before producing final JSON."   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Why Chain-of-Thought (CoT) Works Under the Hood

LLMs generate text **auto-regressively**: each token generated becomes part of the context window for subsequent tokens.
* If you ask an LLM a complex math or logic question and demand an immediate answer:
  * The model must predict the final answer token on Step 1 with zero computation tokens. It frequently hallucinates.
* If you force the model to write out its reasoning first:
  * It generates 50 tokens of intermediate calculations.
  * When it reaches the final token, its self-attention mechanism attends to those 50 intermediate tokens, vastly increasing mathematical and logical accuracy!

---

## 3. Building a Type-Safe Prompt Template Engine in TypeScript

In enterprise codebases, prompts should be parameterized templates with strict variable substitution:

```typescript
// PromptTemplate.ts
export class PromptTemplate<TVariables extends Record<string, string | number>> {
  constructor(private template: string) {}

  format(variables: TVariables): string {
    let output = this.template;
    for (const [key, value] of Object.entries(variables)) {
      output = output.replaceAll(`{{${key}}}`, String(value));
    }
    return output;
  }
}

// Usage in an AI service:
interface CodeReviewVariables {
  language: string;
  codeSnippet: string;
  focusArea: string;
}

const codeReviewPrompt = new PromptTemplate<CodeReviewVariables>(`
You are a Staff Software Engineer conducting a strict code review.
Programming Language: {{language}}
Focus Area: {{focusArea}}

Code under review:
\`\`\`{{language}}
{{codeSnippet}}
\`\`\`

Instructions:
1. First, think step-by-step and write out your reasoning in an "internalAnalysis" section.
2. Second, output your final recommendations and security concerns.
Output strictly in JSON format.
`);

// Example compilation:
const promptString = codeReviewPrompt.format({
  language: 'TypeScript',
  focusArea: 'Memory safety & closures',
  codeSnippet: 'function leak() { global.cache = []; }',
});
```
