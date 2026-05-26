export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type ActionType = "keep" | "downgrade" | "switch" | "credits" | "review";

export type ToolInput = {
  id: ToolId;
  plan: string;
  monthlySpend: number;
  seats: number;
};

export type AuditInput = {
  teamSize: number;
  useCase: UseCase;
  tools: ToolInput[];
};

export type ToolRecommendation = {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendedAction: ActionType;
  recommendedPlan: string;
  projectedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  evidence: string[];
};

export type AuditResult = {
  id?: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  projectedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  summary: string;
  createdAt: string;
  leadTier: "efficient" | "watchlist" | "credex";
};

export type LeadInput = {
  auditId: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  website?: string;
};
