import type { Controls, Explanation, RunResult } from "./types";

export const defaultControls: Controls = {
  apply_drainage_correction: true,
  free_text: "",
};

export async function fetchLatest(): Promise<RunResult> {
  const res = await fetch("/api/runs/latest");
  if (!res.ok) throw new Error("Failed to load latest run");
  return res.json();
}

export async function createRun(controls: Controls): Promise<RunResult> {
  const res = await fetch("/api/runs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(controls),
  });
  if (!res.ok) throw new Error("Model run failed");
  return res.json();
}

export async function explainLocation(runId: string, locId: string): Promise<Explanation> {
  const res = await fetch(`/api/runs/${runId}/explain/${locId}`);
  if (!res.ok) throw new Error("Explain request failed");
  return res.json();
}

export async function fetchAudit() {
  const res = await fetch("/api/audit");
  if (!res.ok) throw new Error("Audit fetch failed");
  return res.json() as Promise<{ ledger: Array<Record<string, unknown>>; chain: { ok: boolean; entries: number } }>;
}
