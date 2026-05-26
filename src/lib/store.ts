import { promises as fs } from "node:fs";
import path from "node:path";
import type { AuditResult, LeadInput } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const auditsPath = path.join(dataDir, "audits.json");
const leadsPath = path.join(dataDir, "leads.json");

type MemoryStore = {
  audits: Record<string, AuditResult>;
  leads: (LeadInput & { createdAt: string })[];
};

const memoryStore = (globalThis as typeof globalThis & { __spendcheckStore?: MemoryStore }).__spendcheckStore ?? {
  audits: {},
  leads: [],
};

(globalThis as typeof globalThis & { __spendcheckStore?: MemoryStore }).__spendcheckStore = memoryStore;

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filePath: string, value: T) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

async function supabaseRequest(pathname: string, init: RequestInit) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  return response;
}

export async function saveAudit(result: AuditResult) {
  const id = result.id ?? crypto.randomUUID();
  const publicResult: AuditResult = {
    ...result,
    id,
    input: {
      ...result.input,
      tools: result.input.tools.map((tool) => ({ ...tool })),
    },
  };

  const supabase = await supabaseRequest("audits", {
    method: "POST",
    body: JSON.stringify({ id, result: publicResult, created_at: publicResult.createdAt }),
  });
  if (!supabase) {
    memoryStore.audits[id] = publicResult;
    try {
      const audits = await readJson<Record<string, AuditResult>>(auditsPath, {});
      audits[id] = publicResult;
      await writeJson(auditsPath, audits);
    } catch {
      // Vercel serverless functions cannot rely on writing beside the app bundle.
      // The in-memory fallback keeps the demo usable until Supabase is configured.
    }
  }
  return publicResult;
}

export async function getAudit(id: string) {
  const supabase = await supabaseRequest(`audits?id=eq.${encodeURIComponent(id)}&select=result`, {
    method: "GET",
    headers: { prefer: "" },
  });
  if (supabase) {
    const rows = (await supabase.json()) as { result: AuditResult }[];
    return rows[0]?.result ?? null;
  }
  if (memoryStore.audits[id]) return memoryStore.audits[id];
  const audits = await readJson<Record<string, AuditResult>>(auditsPath, {});
  return audits[id] ?? null;
}

export async function saveLead(lead: LeadInput) {
  if (lead.website) return { ok: true, ignored: true };
  const payload = { ...lead, createdAt: new Date().toISOString() };
  const supabase = await supabaseRequest("leads", {
    method: "POST",
    body: JSON.stringify({
      audit_id: lead.auditId,
      email: lead.email,
      company_name: lead.companyName ?? null,
      role: lead.role ?? null,
      team_size: lead.teamSize ?? null,
      created_at: payload.createdAt,
    }),
  });
  if (!supabase) {
    memoryStore.leads.push(payload);
    try {
      const leads = await readJson<typeof payload[]>(leadsPath, []);
      leads.push(payload);
      await writeJson(leadsPath, leads);
    } catch {
      // Keep the lead capture flow non-blocking without Supabase.
    }
  }
  return { ok: true };
}
