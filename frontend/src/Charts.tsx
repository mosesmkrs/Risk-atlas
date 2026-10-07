import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RunResult } from "./types";
import { clsLabel, money } from "./format";

export function EpChart({ run }: { run: RunResult }) {
  const data = run.ep_curve.map((row) => ({
    rp: row.return_period_years,
    withAI: row.loss_kes,
    proxyOnly: row.baseline_loss_kes,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(232,214,163,0.12)" />
        <XAxis dataKey="rp" tick={{ fill: "#9bb0bd", fontSize: 11 }} label={{ value: "Assumed return period (years)", fill: "#9bb0bd", fontSize: 11, position: "insideBottom", offset: -2 }} />
        <YAxis tickFormatter={(v) => money(Number(v))} tick={{ fill: "#9bb0bd", fontSize: 11 }} width={88} />
        <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#132a3a", border: "1px solid #d4b46a" }} />
        <Legend />
        <Line type="monotone" dataKey="withAI" stroke="#c45c3a" strokeWidth={2} name="Loss (current run)" />
        <Line type="monotone" dataKey="proxyOnly" stroke="#9bb0bd" strokeDasharray="4 4" strokeWidth={2} name="Proxy only (no drainage AI)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ClassChart({ run }: { run: RunResult }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={run.by_housing_class.map((r) => ({ ...r, name: clsLabel(r.housing_class) }))}>
        <CartesianGrid stroke="rgba(232,214,163,0.12)" />
        <XAxis dataKey="name" tick={{ fill: "#9bb0bd", fontSize: 11 }} />
        <YAxis tickFormatter={(v) => money(Number(v))} tick={{ fill: "#9bb0bd", fontSize: 11 }} width={88} />
        <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#132a3a", border: "1px solid #d4b46a" }} />
        <Bar dataKey="aal_kes" fill="#d4b46a" name="AAL" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ShapGlobal({ run }: { run: RunResult }) {
  const data = run.explainability.global_shap.slice(0, 8).map((r) => ({
    name: r.feature.replaceAll("_", " "),
    value: r.mean_abs_shap_kes,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 110 }}>
        <CartesianGrid stroke="rgba(232,214,163,0.12)" />
        <XAxis type="number" tickFormatter={(v) => money(Number(v))} tick={{ fill: "#9bb0bd", fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fill: "#9bb0bd", fontSize: 11 }} width={110} />
        <Tooltip formatter={(v) => money(Number(v))} contentStyle={{ background: "#132a3a", border: "1px solid #d4b46a" }} />
        <Bar dataKey="value" fill="#c45c3a" name="Mean |SHAP|" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
