import type { ToolId, UseCase } from "./types";
import { usdToInr } from "./money";

export type Plan = {
  name: string;
  monthlyInr: number | null;
  perSeat: boolean;
  useCases: UseCase[];
  minSeats?: number;
  enterprise?: boolean;
  notes: string;
};

export const TOOL_LABELS: Record<ToolId, string> = {
  cursor: "Cursor",
  "github-copilot": "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export const PRICING: Record<ToolId, Plan[]> = {
  cursor: [
    { name: "Hobby", monthlyInr: 0, perSeat: false, useCases: ["coding"], notes: "Light personal usage." },
    { name: "Pro", monthlyInr: usdToInr(20), perSeat: true, useCases: ["coding"], notes: "Individual developer plan." },
    { name: "Business", monthlyInr: usdToInr(40), perSeat: true, useCases: ["coding"], minSeats: 3, notes: "Team billing, admin controls, SSO-adjacent controls." },
    { name: "Enterprise", monthlyInr: null, perSeat: true, useCases: ["coding"], minSeats: 25, enterprise: true, notes: "Custom price with SCIM, audit logs, priority support." },
  ],
  "github-copilot": [
    { name: "Individual", monthlyInr: usdToInr(10), perSeat: true, useCases: ["coding"], notes: "Best for solo developers." },
    { name: "Business", monthlyInr: usdToInr(19), perSeat: true, useCases: ["coding"], minSeats: 3, notes: "Org controls, policy management, IP indemnity." },
    { name: "Enterprise", monthlyInr: usdToInr(39), perSeat: true, useCases: ["coding"], minSeats: 25, enterprise: true, notes: "GitHub.com chat and codebase context." },
  ],
  claude: [
    { name: "Free", monthlyInr: 0, perSeat: true, useCases: ["writing", "research", "mixed"], notes: "Limited usage." },
    { name: "Pro", monthlyInr: usdToInr(20), perSeat: true, useCases: ["writing", "research", "mixed"], notes: "Individual usage." },
    { name: "Max", monthlyInr: usdToInr(100), perSeat: true, useCases: ["coding", "research", "mixed"], notes: "Higher limits for power users." },
    { name: "Team", monthlyInr: usdToInr(30), perSeat: true, useCases: ["writing", "research", "mixed", "data"], minSeats: 5, notes: "Collaboration and admin features." },
    { name: "Enterprise", monthlyInr: null, perSeat: true, useCases: ["mixed"], minSeats: 25, enterprise: true, notes: "Security, SSO, enterprise admin." },
    { name: "API direct", monthlyInr: null, perSeat: false, useCases: ["coding", "data", "mixed"], notes: "Pay by tokens; Sonnet reference $3/M input + $15/M output, converted to INR for reporting." },
  ],
  chatgpt: [
    { name: "Plus", monthlyInr: 1999, perSeat: true, useCases: ["writing", "research", "mixed"], notes: "Individual India billing plan." },
    { name: "Team", monthlyInr: usdToInr(30), perSeat: true, useCases: ["writing", "research", "data", "mixed"], minSeats: 2, notes: "Workspace and admin controls." },
    { name: "Enterprise", monthlyInr: null, perSeat: true, useCases: ["mixed"], minSeats: 25, enterprise: true, notes: "Custom security, compliance, admin." },
    { name: "API direct", monthlyInr: null, perSeat: false, useCases: ["coding", "data", "mixed"], notes: "Pay by API usage; separate from ChatGPT subscriptions." },
  ],
  "anthropic-api": [
    { name: "API direct", monthlyInr: null, perSeat: false, useCases: ["coding", "data", "research", "mixed"], notes: "Claude Sonnet reference $3/M input + $15/M output, converted to INR for reporting." },
  ],
  "openai-api": [
    { name: "API direct", monthlyInr: null, perSeat: false, useCases: ["coding", "data", "research", "mixed"], notes: "GPT-5 class API billed separately from ChatGPT, converted to INR for reporting." },
  ],
  gemini: [
    { name: "Pro", monthlyInr: 1950, perSeat: true, useCases: ["writing", "research", "mixed"], notes: "Google AI Pro subscription in India." },
    { name: "Ultra", monthlyInr: usdToInr(100), perSeat: true, useCases: ["research", "mixed"], notes: "Higher usage tier benchmarked from public Ultra pricing." },
    { name: "API", monthlyInr: null, perSeat: false, useCases: ["coding", "data", "mixed"], notes: "Usage-based Gemini API." },
  ],
  windsurf: [
    { name: "Free", monthlyInr: 0, perSeat: true, useCases: ["coding"], notes: "Light coding usage." },
    { name: "Pro", monthlyInr: usdToInr(20), perSeat: true, useCases: ["coding"], notes: "Individual coding plan." },
    { name: "Teams", monthlyInr: usdToInr(40), perSeat: true, useCases: ["coding"], minSeats: 3, notes: "Team admin and centralized billing." },
    { name: "Enterprise", monthlyInr: null, perSeat: true, useCases: ["coding"], minSeats: 25, enterprise: true, notes: "Custom enterprise plan." },
  ],
};

export function planCost(toolId: ToolId, planName: string, seats: number): number | null {
  const plan = PRICING[toolId].find((item) => item.name.toLowerCase() === planName.toLowerCase());
  if (!plan || plan.monthlyInr === null) return null;
  return Math.round(plan.perSeat ? plan.monthlyInr * Math.max(1, seats) : plan.monthlyInr);
}
