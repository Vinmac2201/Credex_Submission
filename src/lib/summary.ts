import { fallbackSummary } from "./audit";
import type { AuditResult } from "./types";

export async function generateSummary(result: AuditResult) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackSummary(result);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
      max_tokens: 180,
      temperature: 0.2,
      system:
        "You write concise CFO-readable software spend audit summaries. Do not invent savings beyond the provided numbers. Keep it around 100 words.",
      messages: [
        {
          role: "user",
          content: `Write a personalized summary for this AI spend audit:\n${JSON.stringify(
            {
              useCase: result.input.useCase,
              teamSize: result.input.teamSize,
              currency: "INR",
              totalSpendInr: result.totalMonthlySpend,
              savingsInr: result.totalMonthlySavings,
              recommendations: result.recommendations.map((item) => ({
                tool: item.toolName,
                action: item.recommendedAction,
                savings: item.monthlySavings,
                reason: item.reason,
              })),
            },
            null,
            2,
          )}`,
        },
      ],
    }),
  });

  if (!response.ok) return fallbackSummary(result);
  const data = (await response.json()) as { content?: { text?: string }[] };
  return data.content?.find((part) => part.text)?.text?.trim() || fallbackSummary(result);
}
