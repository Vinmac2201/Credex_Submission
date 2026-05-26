"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeDollarSign, CheckCircle2, Copy, Plus, Trash2 } from "lucide-react";
import { formatInr } from "@/lib/money";
import { PRICING, TOOL_LABELS } from "@/lib/pricing";
import type { AuditInput, AuditResult, ToolId, ToolInput, UseCase } from "@/lib/types";

const defaultTool: ToolInput = { id: "cursor", plan: "Pro", monthlySpend: 1960, seats: 1 };
const useCases: UseCase[] = ["coding", "writing", "data", "research", "mixed"];
const storageKey = "spendcheck-form-v2-inr";

function numericValue(value: number) {
  return value === 0 ? "" : String(value);
}

function parseNumber(value: string, fallback = 0) {
  if (value.trim() === "") return fallback;
  return Math.max(0, Number(value.replace(/^0+(?=\d)/, "")) || fallback);
}

function savedInput(): AuditInput {
  const saved = window.localStorage.getItem(storageKey);
  if (!saved) return { teamSize: 4, useCase: "coding", tools: [defaultTool] };
  try {
    const parsed = JSON.parse(saved) as AuditInput;
    return {
      teamSize: parsed.teamSize || 4,
      useCase: parsed.useCase || "coding",
      tools: parsed.tools?.length ? parsed.tools : [defaultTool],
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return { teamSize: 4, useCase: "coding", tools: [defaultTool] };
  }
}

export default function Home() {
  const [formInput, setFormInput] = useState<AuditInput>({ teamSize: 4, useCase: "coding", tools: [defaultTool] });
  const [storageReady, setStorageReady] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [lead, setLead] = useState({ email: "", companyName: "", role: "", website: "" });

  const { teamSize, useCase, tools } = formInput;

  useEffect(() => {
    window.setTimeout(() => {
      setFormInput(savedInput());
      setStorageReady(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify(formInput));
  }, [formInput, storageReady]);

  const shareUrl = useMemo(() => {
    if (!result?.id || typeof window === "undefined") return "";
    return `${window.location.origin}/audit/${result.id}`;
  }, [result?.id]);

  async function submitAudit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formInput),
      });
      if (!response.ok) throw new Error("Audit failed");
      const json = (await response.json()) as AuditResult;
      setResult(json);
    } catch {
      setError("The audit could not complete. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(event: FormEvent) {
    event.preventDefault();
    if (!result?.id) return;
    await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...lead, auditId: result.id, teamSize }),
    });
    setLeadSent(true);
  }

  function updateTool(index: number, next: Partial<ToolInput>) {
    setFormInput((current) => ({
      ...current,
      tools: current.tools.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const updated = { ...item, ...next };
        if (next.id) {
          const nextPlan = PRICING[next.id].find((plan) => plan.monthlyInr !== null) ?? PRICING[next.id][0];
          updated.plan = nextPlan.name;
          updated.monthlySpend = nextPlan.monthlyInr ?? 0;
        }
        return updated;
      }),
    }));
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Free AI spend audit</p>
          <h1>Find the AI tools quietly taxing your runway.</h1>
          <p className="subhead">
            Enter your Cursor, Claude, ChatGPT, Copilot, Gemini, API, and Windsurf spend in rupees. Get a defensible savings audit before anyone asks for your email.
          </p>
        </div>
        <div className="hero-stat" aria-label="Example savings">
          <BadgeDollarSign size={28} />
          <span>₹5.2L</span>
          <small>example annual savings found in under 90 seconds</small>
        </div>
      </section>

      <section className="workspace">
        <form className="panel" onSubmit={submitAudit}>
          <div className="section-heading">
            <h2>Your stack</h2>
            <button type="button" className="icon-button" aria-label="Add tool" onClick={() => setFormInput({ ...formInput, tools: [...tools, defaultTool] })}>
              <Plus size={18} />
            </button>
          </div>

          <div className="grid two">
            <label>
              Team size
              <input inputMode="numeric" pattern="[0-9]*" value={numericValue(teamSize)} onChange={(event) => setFormInput({ ...formInput, teamSize: Math.max(1, parseNumber(event.target.value, 1)) })} />
            </label>
            <label>
              Primary use case
              <select value={useCase} onChange={(event) => setFormInput({ ...formInput, useCase: event.target.value as UseCase })}>
                {useCases.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="tool-list">
            {tools.map((tool, index) => (
              <div className="tool-row" key={`${tool.id}-${index}`}>
                <label>
                  Tool
                  <select value={tool.id} onChange={(event) => updateTool(index, { id: event.target.value as ToolId })}>
                    {(Object.keys(TOOL_LABELS) as ToolId[]).map((id) => (
                      <option key={id} value={id}>
                        {TOOL_LABELS[id]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Plan
                  <select value={tool.plan} onChange={(event) => updateTool(index, { plan: event.target.value })}>
                    {PRICING[tool.id].map((plan) => (
                      <option key={plan.name} value={plan.name}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Monthly spend (₹)
                  <input inputMode="numeric" pattern="[0-9]*" value={numericValue(tool.monthlySpend)} onChange={(event) => updateTool(index, { monthlySpend: parseNumber(event.target.value) })} />
                </label>
                <label>
                  Seats
                  <input inputMode="numeric" pattern="[0-9]*" value={numericValue(tool.seats)} onChange={(event) => updateTool(index, { seats: Math.max(1, parseNumber(event.target.value, 1)) })} />
                </label>
                <button type="button" className="icon-button danger" aria-label="Remove tool" onClick={() => setFormInput({ ...formInput, tools: tools.filter((_, itemIndex) => itemIndex !== index) })}>
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <button className="primary" disabled={loading}>
            {loading ? "Auditing..." : "Run free audit"}
            <ArrowRight size={18} />
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>

        <aside className="results" aria-live="polite">
          {!result ? (
            <div className="empty-state">
              <CheckCircle2 />
              <h2>No email gate. No fake savings.</h2>
              <p>The audit appears here instantly, with public pricing assumptions and a shareable report link.</p>
            </div>
          ) : (
            <>
              <div className={`savings-card ${result.leadTier}`}>
                <span>Potential savings</span>
                <strong>{formatInr(result.totalMonthlySavings)}/mo</strong>
                <small>{formatInr(result.totalAnnualSavings)}/yr</small>
              </div>
              <p className="summary">{result.summary}</p>
              {result.leadTier === "credex" && (
                <div className="credex-callout">
                  <h3>Credex can help capture this.</h3>
                  <p>Your audit shows more than ₹50,000/mo in savings. Discounted infrastructure credits are likely the least disruptive path.</p>
                  <a href="https://cal.com/" target="_blank" rel="noreferrer">
                    Book a Credex consultation
                  </a>
                </div>
              )}
              <div className="breakdown">
                {result.recommendations.map((item) => (
                  <article key={item.toolId + item.currentPlan}>
                    <div>
                      <h3>{item.toolName}</h3>
                      <p>
                        {formatInr(item.currentMonthlySpend)} &rarr; {formatInr(item.projectedMonthlySpend)}
                      </p>
                    </div>
                    <strong>{formatInr(item.monthlySavings)}/mo</strong>
                    <span>{item.recommendedAction}: {item.recommendedPlan}</span>
                    <p>{item.reason}</p>
                  </article>
                ))}
              </div>
              <div className="share">
                <input readOnly value={shareUrl} aria-label="Share URL" />
                <button type="button" className="icon-button" aria-label="Copy share URL" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                  <Copy size={17} />
                </button>
              </div>
              <form className="lead-form" onSubmit={submitLead}>
                <h3>{result.leadTier === "efficient" ? "Get notified when your stack changes" : "Email me this report"}</h3>
                <input required type="email" placeholder="work@email.com" value={lead.email} onChange={(event) => setLead({ ...lead, email: event.target.value })} />
                <input placeholder="Company name" value={lead.companyName} onChange={(event) => setLead({ ...lead, companyName: event.target.value })} />
                <input placeholder="Role" value={lead.role} onChange={(event) => setLead({ ...lead, role: event.target.value })} />
                <input className="honeypot" tabIndex={-1} autoComplete="off" placeholder="Website" value={lead.website} onChange={(event) => setLead({ ...lead, website: event.target.value })} />
                <button className="primary" disabled={leadSent}>{leadSent ? "Sent" : "Capture report"}</button>
              </form>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
