import { describe, expect, it } from "vitest";
import { auditSpend } from "./audit";
import type { AuditInput } from "./types";

function run(input: Partial<AuditInput> & Pick<AuditInput, "tools">) {
  return auditSpend({ teamSize: 4, useCase: "coding", ...input });
}

describe("auditSpend", () => {
  it("downgrades small Cursor Business teams when Pro fits", () => {
    const result = run({ tools: [{ id: "cursor", plan: "Business", monthlySpend: 15680, seats: 4 }] });
    expect(result.totalMonthlySavings).toBe(7840);
    expect(result.recommendations[0].recommendedAction).toBe("downgrade");
    expect(result.recommendations[0].recommendedPlan).toBe("Pro");
  });

  it("flags large API retail spend for discounted credits", () => {
    const result = run({ tools: [{ id: "openai-api", plan: "API direct", monthlySpend: 200000, seats: 1 }] });
    expect(result.totalMonthlySavings).toBe(60000);
    expect(result.leadTier).toBe("credex");
    expect(result.recommendations[0].recommendedAction).toBe("credits");
  });

  it("keeps efficient spend when savings are not material", () => {
    const result = run({ tools: [{ id: "github-copilot", plan: "Business", monthlySpend: 7448, seats: 4 }] });
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.leadTier).toBe("efficient");
    expect(result.recommendations[0].recommendedAction).toBe("keep");
  });

  it("does not recommend free Hobby for active Cursor Pro overspend", () => {
    const result = run({ teamSize: 1, tools: [{ id: "cursor", plan: "Pro", monthlySpend: 25000, seats: 1 }] });
    expect(result.recommendations[0].recommendedAction).toBe("review");
    expect(result.recommendations[0].recommendedPlan).toBe("Pro list-price billing");
    expect(result.recommendations[0].projectedMonthlySpend).toBe(1960);
  });

  it("reviews enterprise plans for teams below enterprise scale", () => {
    const result = run({ teamSize: 8, tools: [{ id: "claude", plan: "Enterprise", monthlySpend: 120000, seats: 8 }] });
    expect(result.recommendations[0].recommendedAction).toBe("review");
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it("switches from Gemini Ultra when a cheaper general assistant fits", () => {
    const result = run({
      useCase: "research",
      tools: [{ id: "gemini", plan: "Ultra", monthlySpend: 29400, seats: 3 }],
    });
    expect(result.recommendations[0].recommendedAction).toMatch(/downgrade|switch/);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(23500);
  });

  it("aggregates monthly and annual savings across tools", () => {
    const result = run({
      tools: [
        { id: "cursor", plan: "Business", monthlySpend: 15680, seats: 4 },
        { id: "anthropic-api", plan: "API direct", monthlySpend: 100000, seats: 1 },
      ],
    });
    expect(result.totalMonthlySavings).toBe(37840);
    expect(result.totalAnnualSavings).toBe(454080);
  });
});
