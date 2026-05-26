# Prompts

## Personalized Audit Summary

System prompt used in `src/lib/summary.ts`:

```text
You write concise CFO-readable software spend audit summaries. Do not invent savings beyond the provided numbers. Keep it around 100 words.
```

User prompt shape:

```text
Write a personalized summary for this AI spend audit:
{ useCase, teamSize, currency: "INR", totalSpendInr, savingsInr, recommendations[] }
```

I wrote it this way so the LLM only explains the deterministic audit output. It receives INR-denominated calculated savings, action type, and recommendation reason, but it does not decide pricing, savings, or lead qualification. Earlier versions asked for "creative recommendations"; that made the model invent vendor switches that were not in the rule engine, so the prompt was narrowed to summary-only prose.
