import { NextRequest, NextResponse } from "next/server";
import { auditSpend } from "@/lib/audit";
import { rateLimited } from "@/lib/rate-limit";
import { saveAudit } from "@/lib/store";
import { generateSummary } from "@/lib/summary";
import type { AuditInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(`audit:${ip}`)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const input = (await request.json()) as AuditInput;
  if (!input.teamSize || !Array.isArray(input.tools) || input.tools.length === 0) {
    return NextResponse.json({ error: "Missing audit input" }, { status: 400 });
  }

  const draft = auditSpend(input);
  const summary = await generateSummary(draft).catch(() => "");
  const saved = await saveAudit(auditSpend(input, summary));
  return NextResponse.json(saved);
}
