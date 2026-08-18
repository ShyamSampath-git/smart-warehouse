import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Filter,
  Gauge,
  PackageSearch,
  Play,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type WarehouseOrder = {
  id: number;
  externalId: string;
  customer: string;
  valueCents: number;
  status: string;
  priority: string;
  sla: string;
  zone: string;
  regionCode: string;
  isConflict: boolean;
};

type CommandCenterPanelProps = {
  orders: WarehouseOrder[];
  conflict: WarehouseOrder | undefined;
  zoneFilter: string;
  regionName: (code: string) => string;
  onCycleRegion: () => void;
  onRefresh: () => void;
  onResolve: () => void;
  onAdvance: (orderId: number) => void;
  advancing: boolean;
};

const formatINR = (cents: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
}).format(cents / 100);

export function CommandCenterPanel({
  orders,
  conflict,
  zoneFilter,
  regionName,
  onCycleRegion,
  onRefresh,
  onResolve,
  onAdvance,
  advancing,
}: CommandCenterPanelProps) {
  const statuses = ["Created", "Allocated", "Picking", "Packing"];

  return <>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Fill rate" value="96.8%" detail="+2.4%" icon={<Gauge size={17} />} tone="teal" />
      <MetricCard label="On-time dispatch" value="93.4%" detail="+1.8%" icon={<Truck size={17} />} tone="indigo" />
      <MetricCard label="Orders in motion" value={String(orders.filter(order => order.status !== "Dispatched").length)} detail="Live across India" icon={<PackageSearch size={17} />} tone="sky" />
      <MetricCard label="Needs attention" value={conflict ? "01" : "00"} detail="Private sync" icon={<AlertTriangle size={17} />} tone="rose" />
    </div>

    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.82fr)]">
      <section className="glass-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
          <div><h3 className="font-display text-sm font-semibold text-white">Fulfilment flow</h3><p className="mt-1 text-xs text-slate-500">Account-specific orders across Indian hubs</p></div>
          <div className="flex items-center gap-2"><button className="glass-button" onClick={onCycleRegion}><Filter size={13} /> {zoneFilter === "All regions" ? zoneFilter : regionName(zoneFilter)} <ChevronDown size={12} /></button><button className="glass-icon-button" onClick={onRefresh} aria-label="Refresh flow"><RefreshCw size={15} /></button></div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-4">{statuses.map((status, index) => {
          const count = orders.filter(order => order.status === status).length;
          const colors = ["bg-slate-400", "bg-indigo-300", "bg-sky-300", "bg-teal-300"];
          return <div key={status} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"><div className="flex items-center justify-between text-xs text-slate-400"><span>{status}</span><span className="font-semibold text-slate-200">{count}</span></div><div className="mt-5 h-1.5 rounded-full bg-white/[0.07]"><div className={`${colors[index]} h-full rounded-full`} style={{ width: `${Math.max(8, count * 35)}%` }} /></div><div className="mt-2 text-[10px] text-slate-600">Saved workload</div></div>;
        })}</div>
        <div className="border-t border-white/[0.07] px-5 py-4"><div className="grid grid-cols-5 gap-2 text-center text-[10px] text-slate-500"><span>Mumbai</span><span>Bengaluru</span><span>Delhi NCR</span><span>Chennai</span><span>Kolkata</span></div><div className="mt-4 rounded-xl border border-indigo-300/10 bg-indigo-300/[0.045] p-3 text-[11px] text-slate-400"><span className="font-semibold text-indigo-200">India data route:</span> values are shown in INR, time is shown in IST, and every operational action stays in your private account.</div></div>
      </section>

      <section className="glass-panel overflow-hidden"><div className="border-b border-white/[0.08] px-5 py-4"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">Intelligence alert</span><span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${conflict ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"}`}>{conflict ? "Action needed" : "Resolved"}</span></div><h3 className="mt-4 font-display text-xl font-semibold text-white">{conflict ? "Mumbai allocation conflict" : "Urgent order protected"}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{conflict ? `${conflict.externalId} needs 10 units; only 7 are available across the hub.` : "The last decision is in your private audit trail."}</p></div>{conflict ? <><div className="grid grid-cols-3 gap-2 px-5 py-4"><Metric label="Required" value="10" /><Metric label="Available" value="7" danger /><Metric label="At risk" value="₹1.2L" warning /></div><button className="mx-5 mb-5 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-lg bg-teal-300 px-3.5 py-3 text-xs font-bold text-[#07151b] transition hover:bg-teal-200" onClick={onResolve}>Open impact simulation <ArrowRight size={15} /></button></> : <div className="m-5 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] p-4 text-xs text-emerald-100">No currently open allocation conflict.</div>}</section>
    </div>

    <section className="mt-6 glass-panel overflow-hidden"><div className="border-b border-white/[0.07] px-5 py-4"><h3 className="font-display text-sm font-semibold text-white">Priority queue</h3><p className="mt-1 text-xs text-slate-500">Orders sorted by SLA exposure and Indian hub coverage</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-5 py-3 font-semibold">Order</th><th className="px-3 py-3 font-semibold">Priority</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">SLA</th><th className="px-3 py-3 font-semibold">Hub</th><th className="px-5 py-3 text-right font-semibold">Action</th></tr></thead><tbody className="divide-y divide-white/[0.05]">{orders.slice(0, 5).map(order => <tr key={order.id} className="transition hover:bg-white/[0.025]"><td className="px-5 py-3.5"><div className="text-xs font-semibold text-white">{order.externalId}</div><div className="mt-0.5 text-[11px] text-slate-500">{order.customer} · {formatINR(order.valueCents)}</div></td><td className="px-3 py-3.5"><span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">{order.priority}</span></td><td className="px-3 py-3.5 text-xs text-slate-300">{order.status}</td><td className="px-3 py-3.5 text-xs text-slate-400">{order.sla}</td><td className="px-3 py-3.5 text-xs text-slate-400">{order.zone}</td><td className="px-5 py-3.5 text-right">{order.isConflict ? <Button size="sm" className="h-7 bg-teal-300 text-[10px] text-[#07151b] hover:bg-teal-200" onClick={onResolve}>Resolve</Button> : <Button size="sm" variant="outline" disabled={advancing || order.status === "Dispatched"} className="h-7 border-white/10 bg-white/[0.04] text-[10px] text-slate-200 hover:bg-white/[0.08]" onClick={() => onAdvance(order.id)}><Play size={11} /> {order.status === "Dispatched" ? "Done" : "Advance"}</Button>}</td></tr>)}</tbody></table></div></section>
  </>;
}

function MetricCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: string }) { const tones: Record<string, string> = { teal: "bg-teal-400/20", indigo: "bg-indigo-400/20", sky: "bg-sky-400/20", rose: "bg-rose-400/20" }; return <div className="glass-panel group relative overflow-hidden p-5"><div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${tones[tone]}`} /><div className="relative flex items-start justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p><p className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{value}</p><p className="mt-2 text-xs text-slate-400"><span className="text-teal-300">{detail}</span></p></div><div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-slate-300">{icon}</div></div></div>; }
function Metric({ label, value, danger, warning }: { label: string; value: string; danger?: boolean; warning?: boolean }) { return <div className={`rounded-lg border p-2.5 ${danger ? "border-rose-300/15 bg-rose-300/[0.06]" : warning ? "border-amber-300/15 bg-amber-300/[0.06]" : "border-white/[0.08] bg-black/10"}`}><div className="text-[10px] text-slate-500">{label}</div><div className="mt-1 font-display text-lg font-semibold text-white">{value}</div></div>; }
