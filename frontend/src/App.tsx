import { useCallback, useEffect, useState } from "react";
import { createRun, defaultControls, explainLocation, fetchAudit, fetchLatest } from "./api";
import { ClassChart, EpChart, ShapGlobal } from "./Charts";
import { clsLabel, money, pct } from "./format";
import MapView from "./MapView";
import type { Controls, Explanation, RunResult } from "./types";

const TABS = ["Results", "AI layer", "Explain", "Assumptions"] as const;

export default function App() {
  const [controls, setControls] = useState<Controls>(defaultControls);
  const [run, setRun] = useState<RunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Results");
  const [selected, setSelected] = useState<string>();
  const [explain, setExplain] = useState<Explanation | null>(null);
  const [audit, setAudit] = useState<{ chain: { ok: boolean; entries: number }; ledger: Array<Record<string, unknown>> } | null>(null);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setBusy(true);
    setError(undefined);
    try {
      const latest = await fetchLatest();
      setRun(latest);
      setControls({
        apply_drainage_correction: latest.controls.apply_drainage_correction,
        free_text: latest.controls.free_text || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the model API. Start the backend on port 8000.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!run || !selected) return;
    void explainLocation(run.run_id, selected).then(setExplain).catch(() => setExplain(null));
  }, [run, selected]);

  async function runModel() {
    setBusy(true);
    setError(undefined);
    try {
      const next = await createRun(controls);
      setRun(next);
      setExplain(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  async function openAssumptions() {
    setTab("Assumptions");
    setAudit(await fetchAudit());
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <small>Team A · Nairobi urban flood</small>
          <h1>Flood CAT workbench</h1>
        </div>
        <p className="disclaimer">
          Portfolio is <b>synthetic</b>. Hazard is a <b>proxy</b>, not measured depth. Return periods are an{" "}
          <b>assumption</b>. Treaty layers are out of scope.
        </p>
        <label className="control" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input
            type="checkbox"
            checked={controls.apply_drainage_correction}
            onChange={(e) => setControls({ ...controls, apply_drainage_correction: e.target.checked })}
          />
          <span>
            AI drainage correction
            <div className="muted">Raises scores near Kibera, Westlands, Lavington and other proxy misses. Changes the EP curve.</div>
          </span>
        </label>
        <div className="control">
          <label>
            Free-text exposure <b>AI ingest</b>
          </label>
          <textarea
            rows={5}
            value={controls.free_text}
            onChange={(e) => setControls({ ...controls, free_text: e.target.value })}
            placeholder='e.g. "25 informal iron-sheet houses in Kibera, KES 800,000 each"'
            style={{
              width: "100%",
              background: "#0d1f2c",
              color: "#f4efe4",
              border: "1px solid rgba(232,214,163,0.16)",
              borderRadius: 8,
              padding: 8,
              fontFamily: "inherit",
            }}
          />
        </div>
        <button className="run-btn" disabled={busy} onClick={() => void runModel()}>
          {busy ? "Running pipeline…" : "Run model"}
        </button>
        {error && <p className="disclaimer">{error}</p>}
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <div className="muted">Hazard → Vulnerability → Exposure → Financial engine</div>
            <strong>{run?.model.name ?? "Loading"}</strong>
          </div>
          <div className="tabs">
            {TABS.map((name) => (
              <button
                key={name}
                className={tab === name ? "active" : ""}
                onClick={() => (name === "Assumptions" ? void openAssumptions() : setTab(name))}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {!run ? (
          <p className="muted">Waiting for the first model run…</p>
        ) : (
          <>
            {tab === "Results" && <Results run={run} selected={selected} onSelect={setSelected} />}
            {tab === "AI layer" && <AiPanel run={run} />}
            {tab === "Explain" && <ExplainPanel run={run} explain={explain} selected={selected} onSelect={setSelected} />}
            {tab === "Assumptions" && <Assumptions run={run} audit={audit} />}
          </>
        )}
      </main>
    </div>
  );
}

function Results({
  run,
  selected,
  onSelect,
}: {
  run: RunResult;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const m = run.metrics;
  return (
    <>
      <div className="kpis">
        <div className="kpi">
          <span>Total exposure · SYNTHETIC</span>
          <strong>{money(m.total_tiv_kes)}</strong>
        </div>
        <div className="kpi">
          <span>1-in-100 loss · ASSUMED severe tier</span>
          <strong>{money(m.loss_1_in_100_kes)}</strong>
        </div>
        <div className="kpi">
          <span>1-in-250 loss · ASSUMED extreme tier</span>
          <strong>{money(m.loss_1_in_250_kes)}</strong>
        </div>
        <div className="kpi">
          <span>AAL · from assumed EP</span>
          <strong>{money(m.aal_kes)}</strong>
        </div>
        <div className="kpi">
          <span>AI delta at 1-in-100</span>
          <strong>{money(m.ai_delta_1_in_100_kes)}</strong>
        </div>
      </div>
      <p className="muted">{run.disclaimer}</p>
      <div className="grid-2">
        <div className="card">
          <h2>Portfolio map · loss cost</h2>
          <MapView run={run} selected={selected} onSelect={onSelect} />
        </div>
        <div className="card">
          <h2>EP curve · rarity vs loss</h2>
          <p className="muted">X-axis years are an assumption. Dashed line is the uncorrected proxy.</p>
          <EpChart run={run} />
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h2>Breakdown by housing class</h2>
          <ClassChart run={run} />
        </div>
        <div className="card">
          <h2>Largest location AALs</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Class</th>
                  <th>Hotspot</th>
                  <th>AAL</th>
                </tr>
              </thead>
              <tbody>
                {run.top_locations.map((row) => (
                  <tr key={row.loc_id} className={`clickable ${selected === row.loc_id ? "selected" : ""}`} onClick={() => onSelect(row.loc_id)}>
                    <td>{row.loc_id}</td>
                    <td>{clsLabel(row.housing_class)}</td>
                    <td>{row.nearest_hotspot}</td>
                    <td className="mono">{money(row.aal_kes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function AiPanel({ run }: { run: RunResult }) {
  return (
    <div className="grid-2">
      <div className="card">
        <h2>Underwriter briefing</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 14, lineHeight: 1.5 }}>
          {run.briefing}
        </pre>
      </div>
      <div className="card">
        <h2>What the AI changed</h2>
        <p>{run.ai.effect}</p>
        <p>
          Drainage correction: <b>{run.ai.drainage.enabled ? "ON" : "OFF"}</b>. Buildings uplifted:{" "}
          <b>{run.ai.drainage.buildings_uplifted}</b>.
        </p>
        <p className="muted">{run.ai.drainage.method}</p>
        <p>
          Missed hotspots used: {run.ai.drainage.missed_hotspots.join(", ") || "none"}
        </p>
        <p>
          1-in-100 loss vs uncorrected proxy: <b>{money(run.ai.loss_delta_severe_kes)}</b>
        </p>
        <h2>Free-text ingest</h2>
        <p>Rows added: {run.ai.free_text.rows_added}</p>
        <ul>
          {run.ai.free_text.notes.map((n) => (
            <li key={n} className="muted">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ExplainPanel({
  run,
  explain,
  selected,
  onSelect,
}: {
  run: RunResult;
  explain: Explanation | null;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  const maxAbs = explain ? Math.max(...explain.contributions.map((c) => Math.abs(c.shap_kes)), 1) : 1;
  return (
    <div className="grid-2">
      <div className="card">
        <h2>Global SHAP · location AAL surrogate</h2>
        <p className="muted">{run.explainability.note} R² = {run.explainability.surrogate_r2.toFixed(3)}</p>
        <ShapGlobal run={run} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>AAL</th>
              </tr>
            </thead>
            <tbody>
              {run.top_locations.map((row) => (
                <tr key={row.loc_id} className={`clickable ${selected === row.loc_id ? "selected" : ""}`} onClick={() => onSelect(row.loc_id)}>
                  <td>{row.loc_id}</td>
                  <td>{money(row.aal_kes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h2>Location SHAP</h2>
        {!explain ? (
          <p className="muted">Click a location on the map or table.</p>
        ) : (
          <>
            <p>
              {explain.loc_id}: physics AAL {money(explain.physics_aal_kes)} · surrogate {money(explain.surrogate_prediction_kes)}
            </p>
            {explain.contributions.map((c) => (
              <div className="shap-row" key={c.feature}>
                <span>{c.feature.replaceAll("_", " ")}</span>
                <div className="bar-track">
                  {c.shap_kes >= 0 ? (
                    <div className="bar-pos" style={{ width: `${(c.shap_kes / maxAbs) * 100}%` }} />
                  ) : (
                    <div className="bar-neg" style={{ width: `${(-c.shap_kes / maxAbs) * 100}%` }} />
                  )}
                </div>
                <span className="mono">{money(c.shap_kes)}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Assumptions({
  run,
  audit,
}: {
  run: RunResult;
  audit: { chain: { ok: boolean; entries: number }; ledger: Array<Record<string, unknown>> } | null;
}) {
  return (
    <div className="grid-2">
      <div className="card">
        <h2>Data vs assumption</h2>
        {Object.entries(run.labels).map(([k, v]) => (
          <div className="assumption" key={k}>
            <b>{k}</b>
            <div className="muted">{v}</div>
          </div>
        ))}
        {run.assumptions.map((a) => (
          <div className="assumption" key={a.id}>
            <b>
              {a.id} · {a.provenance} · {a.title}
            </b>
            <div className="muted">{a.statement}</div>
          </div>
        ))}
        <h2>Vulnerability matrix (JRC-adapted)</h2>
        <p className="muted">Damage ratio by depth after score × 4 m. Caps 70–95% as the brief requires.</p>
        {run.vulnerability_matrix.map((row) => (
          <div className="assumption" key={row.housing_class}>
            <b>{clsLabel(row.housing_class)}</b> cap {pct(row.cap)}
            <div className="muted">{row.differs_from_jrc}</div>
            <div className="muted">
              {Object.entries(row.by_depth_m)
                .map(([d, r]) => `${d} m → ${(r * 100).toFixed(0)}%`)
                .join(" · ")}
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2>Audit ledger</h2>
        <p className={audit?.chain.ok ? "flag ok" : "flag"}>
          Chain {audit?.chain.ok ? "verified" : "not loaded"} · {audit?.chain.entries ?? 0} runs
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>1-in-100</th>
                <th>AI on</th>
              </tr>
            </thead>
            <tbody>
              {(audit?.ledger ?? []).slice(0, 12).map((row) => (
                <tr key={String(row.run_id)}>
                  <td>{String(row.created_at).slice(0, 19)}</td>
                  <td>{money(Number((row.metrics as { loss_1_in_100_kes?: number })?.loss_1_in_100_kes ?? 0))}</td>
                  <td>{String((row.controls as { apply_drainage_correction?: boolean })?.apply_drainage_correction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
