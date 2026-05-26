import { PRICING, TOOL_LABELS, planCost } from "./pricing";
import { formatInr, usdToInr } from "./money";
import type { AuditInput, AuditResult, ToolId, ToolInput, ToolRecommendation } from "./types";

const CREDIT_DISCOUNT = 0.3;
const CREDEX_LEAD_THRESHOLD_INR = 50_000;
const EFFICIENT_THRESHOLD_INR = 8_000;

function money(value: number) {
  return Math.max(0, Math.round(value));
}

function baselineFor(tool: ToolInput): number {
  return tool.monthlySpend > 0 ? tool.monthlySpend : planCost(tool.id, tool.plan, tool.seats) ?? 0;
}

function cheaperSameVendor(tool: ToolInput, input: AuditInput) {
  const current = baselineFor(tool);
  const plans = PRICING[tool.id].filter((plan) => plan.monthlyInr !== null && !plan.enterprise);
  return plans
    .filter((plan) => plan.monthlyInr !== 0)
    .filter((plan) => !(["Individual", "Plus", "Pro"].includes(plan.name) && tool.seats > 1 && ["github-copilot", "chatgpt", "claude"].includes(tool.id)))
    .filter((plan) => !plan.minSeats || input.teamSize >= plan.minSeats || tool.seats >= plan.minSeats)
    .filter((plan) => plan.useCases.includes(input.useCase) || plan.useCases.includes("mixed") || input.useCase === "mixed")
    .map((plan) => ({ plan, cost: planCost(tool.id, plan.name, tool.seats) ?? current }))
    .filter((candidate) => candidate.cost < current)
    .sort((a, b) => a.cost - b.cost)[0];
}

function cheaperAlternative(tool: ToolInput) {
  const current = baselineFor(tool);
  const alternatives: Partial<Record<ToolId, { toolId: ToolId; plan: string; cost: number; why: string }[]>> = {
    cursor: [
      { toolId: "github-copilot", plan: "Business", cost: usdToInr(19) * tool.seats, why: "Copilot Business covers team coding assistants with org controls at a lower per-seat price." },
      { toolId: "windsurf", plan: "Pro", cost: usdToInr(20) * tool.seats, why: "Windsurf Pro is a similar coding-agent seat for individual developers." },
    ],
    windsurf: [
      { toolId: "cursor", plan: "Pro", cost: usdToInr(20) * tool.seats, why: "Cursor Pro is comparable for individual coding workflows." },
      { toolId: "github-copilot", plan: "Business", cost: usdToInr(19) * tool.seats, why: "Copilot Business is cheaper for teams that need admin controls." },
    ],
    "github-copilot": [
      { toolId: "cursor", plan: "Pro", cost: usdToInr(20) * tool.seats, why: "Cursor Pro can be a better fit for agentic IDE workflows." },
    ],
    claude: [
      { toolId: "chatgpt", plan: "Plus", cost: 1999 * tool.seats, why: "For general writing and research, ChatGPT Plus is a comparable individual plan in India." },
      { toolId: "gemini", plan: "Pro", cost: 1950 * tool.seats, why: "Gemini Pro is cheaper for Google-heavy research and writing workflows." },
    ],
    chatgpt: [
      { toolId: "claude", plan: "Pro", cost: usdToInr(20) * tool.seats, why: "Claude Pro is comparable for writing and research when workspace admin is not needed." },
      { toolId: "gemini", plan: "Pro", cost: 1950 * tool.seats, why: "Gemini Pro is a lower-cost alternative for research and writing." },
    ],
    gemini: [
      { toolId: "chatgpt", plan: "Plus", cost: 1999 * tool.seats, why: "ChatGPT Plus can cover similar general assistant workflows below Ultra pricing." },
      { toolId: "claude", plan: "Pro", cost: usdToInr(20) * tool.seats, why: "Claude Pro is a comparable research and writing assistant below Ultra pricing." },
    ],
    "anthropic-api": [
      { toolId: "anthropic-api", plan: "discounted credits", cost: current * (1 - CREDIT_DISCOUNT), why: "Committed or secondary-market credits can reduce retail API spend without changing models." },
    ],
    "openai-api": [
      { toolId: "openai-api", plan: "discounted credits", cost: current * (1 - CREDIT_DISCOUNT), why: "Committed or secondary-market credits can reduce retail API spend without changing APIs." },
    ],
  };
  return (alternatives[tool.id] ?? [])
    .filter((item) => item.cost < current * 0.85)
    .sort((a, b) => a.cost - b.cost)[0];
}

export function auditSpend(input: AuditInput, summary = ""): AuditResult {
  const recommendations: ToolRecommendation[] = input.tools
    .filter((tool) => baselineFor(tool) > 0)
    .map((tool) => {
      const current = baselineFor(tool);
      const plan = PRICING[tool.id].find((item) => item.name.toLowerCase() === tool.plan.toLowerCase());
      const downgrade = cheaperSameVendor(tool, input);
      const alternative = cheaperAlternative(tool);
      const evidence: string[] = [];

      if (plan?.enterprise && input.teamSize < 25) {
        const projected = Math.min(downgrade?.cost ?? current, current * 0.7);
        return {
          toolId: tool.id,
          toolName: TOOL_LABELS[tool.id],
          currentPlan: tool.plan,
          currentMonthlySpend: current,
          recommendedAction: "review",
          recommendedPlan: downgrade?.plan.name ?? "non-enterprise contract",
          projectedMonthlySpend: money(projected),
          monthlySavings: money(current - projected),
          annualSavings: money((current - projected) * 12),
          reason: "Enterprise pricing usually pays for security, procurement, SSO, and support; below 25 users those controls often cost more than they return.",
          evidence: ["Team size is below a typical enterprise threshold.", "Custom contracts should be benchmarked against public team pricing."],
        };
      }

      if ((tool.id === "openai-api" || tool.id === "anthropic-api" || tool.plan.toLowerCase().includes("api")) && current >= CREDEX_LEAD_THRESHOLD_INR) {
        const projected = current * (1 - CREDIT_DISCOUNT);
        return {
          toolId: tool.id,
          toolName: TOOL_LABELS[tool.id],
          currentPlan: tool.plan,
          currentMonthlySpend: current,
          recommendedAction: "credits",
          recommendedPlan: "discounted credits",
          projectedMonthlySpend: money(projected),
          monthlySavings: money(current - projected),
          annualSavings: money((current - projected) * 12),
          reason: "At this API volume, the fastest savings path is usually discounted credits rather than switching model families.",
          evidence: ["Retail API invoices are usage-based.", "Credex-style credits target the same vendor spend at a discount."],
        };
      }

      if (downgrade && downgrade.plan.name.toLowerCase() === tool.plan.toLowerCase()) {
        evidence.push(`${downgrade.plan.name} public list pricing is materially below the entered monthly spend.`);
        return {
          toolId: tool.id,
          toolName: TOOL_LABELS[tool.id],
          currentPlan: tool.plan,
          currentMonthlySpend: current,
          recommendedAction: "review",
          recommendedPlan: `${downgrade.plan.name} list-price billing`,
          projectedMonthlySpend: money(downgrade.cost),
          monthlySavings: money(current - downgrade.cost),
          annualSavings: money((current - downgrade.cost) * 12),
          reason: `Your entered spend is far above public ${TOOL_LABELS[tool.id]} ${downgrade.plan.name} pricing for ${tool.seats} seat${tool.seats === 1 ? "" : "s"}. Verify the invoice before changing tools.`,
          evidence,
        };
      }

      if (downgrade && (!alternative || downgrade.cost <= alternative.cost * 1.1)) {
        evidence.push(`${downgrade.plan.name} covers ${downgrade.plan.notes}`);
        return {
          toolId: tool.id,
          toolName: TOOL_LABELS[tool.id],
          currentPlan: tool.plan,
          currentMonthlySpend: current,
          recommendedAction: "downgrade",
          recommendedPlan: downgrade.plan.name,
          projectedMonthlySpend: money(downgrade.cost),
          monthlySavings: money(current - downgrade.cost),
          annualSavings: money((current - downgrade.cost) * 12),
          reason: `Your seat count and ${input.useCase} use case do not require the current plan's premium controls.`,
          evidence,
        };
      }

      if (alternative) {
        return {
          toolId: tool.id,
          toolName: TOOL_LABELS[tool.id],
          currentPlan: tool.plan,
          currentMonthlySpend: current,
          recommendedAction: "switch",
          recommendedPlan: `${TOOL_LABELS[alternative.toolId]} ${alternative.plan}`,
          projectedMonthlySpend: money(alternative.cost),
          monthlySavings: money(current - alternative.cost),
          annualSavings: money((current - alternative.cost) * 12),
          reason: alternative.why,
          evidence: ["Alternative is at least 15% cheaper than current spend.", "Capability match is based on the selected primary use case."],
        };
      }

      return {
        toolId: tool.id,
        toolName: TOOL_LABELS[tool.id],
        currentPlan: tool.plan,
        currentMonthlySpend: current,
        recommendedAction: "keep",
        recommendedPlan: tool.plan,
        projectedMonthlySpend: current,
        monthlySavings: 0,
        annualSavings: 0,
        reason: "Current spend is already close to public plan pricing for the selected team size and use case.",
        evidence: ["No same-vendor or similar-tool alternative clears a material savings threshold."],
      };
    });

  const totalMonthlySpend = recommendations.reduce((sum, item) => sum + item.currentMonthlySpend, 0);
  const projectedMonthlySpend = recommendations.reduce((sum, item) => sum + item.projectedMonthlySpend, 0);
  const totalMonthlySavings = money(totalMonthlySpend - projectedMonthlySpend);

  return {
    input,
    recommendations,
    totalMonthlySpend: money(totalMonthlySpend),
    projectedMonthlySpend: money(projectedMonthlySpend),
    totalMonthlySavings,
    totalAnnualSavings: money(totalMonthlySavings * 12),
    summary,
    createdAt: new Date().toISOString(),
    leadTier: totalMonthlySavings > CREDEX_LEAD_THRESHOLD_INR ? "credex" : totalMonthlySavings < EFFICIENT_THRESHOLD_INR ? "efficient" : "watchlist",
  };
}

export function fallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings > CREDEX_LEAD_THRESHOLD_INR) {
    return `Your stack has a clear savings opportunity: about ${formatInr(result.totalMonthlySavings)} per month, mostly from plan fit and retail credit exposure. The fastest next move is to preserve the tools your team already uses while renegotiating or moving eligible spend to discounted credits.`;
  }
  if (result.totalMonthlySavings < EFFICIENT_THRESHOLD_INR) {
    return `Your AI spend looks disciplined. The audit did not find a material downgrade or switch that would justify operational churn, so the best move is to keep monitoring usage and revisit when your team size, API volume, or security requirements change.`;
  }
  return `There is useful but not urgent savings in this stack. A few plan choices appear heavier than the team needs, and the recommendations prioritize low-disruption changes before any vendor switch.`;
}
