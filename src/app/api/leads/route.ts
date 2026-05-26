import { NextRequest, NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import { sendLeadEmail } from "@/lib/email";
import { getAudit, saveLead } from "@/lib/store";
import type { LeadInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(`lead:${ip}`, 5)) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const lead = (await request.json()) as LeadInput;
  if (!lead.auditId || !lead.email || !lead.email.includes("@")) {
    return NextResponse.json({ error: "Valid email and auditId required" }, { status: 400 });
  }

  const audit = await getAudit(lead.auditId);
  await saveLead(lead);
  await sendLeadEmail(lead, audit).catch(() => ({ ok: false }));
  return NextResponse.json({ ok: true });
}
