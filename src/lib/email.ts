import type { AuditResult, LeadInput } from "./types";
import { formatInr } from "./money";

export async function sendLeadEmail(lead: LeadInput, audit: AuditResult | null) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Credex Audit <audits@example.com>";
  if (!apiKey) return { ok: true, skipped: true };

  const savings = audit ? `${formatInr(audit.totalMonthlySavings)}/mo` : "your audit";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: lead.email,
      subject: "Your SpendCheck AI audit",
      text: `Thanks for running SpendCheck AI. We found ${savings} in potential monthly savings. If your report shows a large credit opportunity, Credex may reach out with options for discounted AI infrastructure credits.`,
    }),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
  return { ok: true };
}
