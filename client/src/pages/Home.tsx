/* Glassline Command: decision-first warehouse control room with layered glass surfaces, signal colors, and calm operational motion. */
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CircleDot,
  ClipboardCheck,
  Clock3,
  Command,
  Download,
  ExternalLink,
  Filter,
  Gauge,
  Layers3,
  Menu,
  PackageCheck,
  PackageSearch,
  PanelLeft,
  ScanLine,
  Search,
  Settings2,
  ShieldAlert,
  Sparkles,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const navItems = [
  { label: "Command center", icon: Command },
  { label: "Orders", icon: ClipboardCheck },
  { label: "Inventory", icon: Boxes },
  { label: "Picking & packing", icon: PackageCheck },
  { label: "Analytics", icon: BarChart3 },
];

const orders = [
  { id: "#10482", customer: "Northstar Retail", priority: "Urgent", status: "Conflict", time: "18 min", value: "$4,820", tone: "rose" },
  { id: "#10479", customer: "Atlas Outfitters", priority: "High", status: "Picking", time: "42 min", value: "$2,180", tone: "amber" },
  { id: "#10477", customer: "Canyon & Co.", priority: "Standard", status: "Allocated", time: "1h 08m", value: "$960", tone: "sky" },
  { id: "#10474", customer: "Morrow Supply", priority: "Standard", status: "Packing", time: "1h 26m", value: "$1,420", tone: "emerald" },
];

const resolutionOptions = [
  { id: "reallocate", rank: "01", title: "Protect urgent SLA", detail: "Reallocate 3 units from order #10431, then partially fulfill the lower-priority order.", score: "92", satisfaction: "+18", revenue: "$0", cost: "$42", sla: "Low", accent: "teal", recommended: true },
  { id: "backorder", rank: "02", title: "Backorder the shortfall", detail: "Partially fulfill #10482, create a backorder, and trigger an expedited reorder.", score: "78", satisfaction: "+6", revenue: "$680", cost: "$86", sla: "Medium", accent: "indigo" },
  { id: "substitute", rank: "03", title: "Offer a close substitute", detail: "Swap SKU-X for SKU-XR from Zone B with a 96% product match confidence.", score: "71", satisfaction: "+4", revenue: "$0", cost: "$18", sla: "Medium", accent: "sky" },
  { id: "escalate", rank: "04", title: "Hold and escalate", detail: "Keep both reservations intact and route the exception to the duty manager.", score: "44", satisfaction: "−12", revenue: "$1,240", cost: "$0", sla: "High", accent: "rose" },
];

function StatCard({ label, value, delta, icon: Icon, tone }: { label: string; value: string; delta: string; icon: typeof Gauge; tone: string }) {
  return (
    <div className="glass-panel group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${tone}`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-400"><span className="text-teal-300">{delta}</span> vs. yesterday</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 text-slate-300"><Icon size={17} /></div>
      </div>
    </div>
  );
}

function ToneBadge({ children, tone }: { children: React.ReactNode; tone: string }) {
  const tones: Record<string, string> = {
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-200",
    emerald: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    sky: "border-sky-300/20 bg-sky-300/10 text-sky-200",
    teal: "border-teal-300/20 bg-teal-300/10 text-teal-200",
  };
  return <Badge className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tones[tone] || tones.sky}`}>{children}</Badge>;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Command center");
  const [resolverOpen, setResolverOpen] = useState(true);
  const [selectedResolution, setSelectedResolution] = useState("reallocate");
  const [query, setQuery] = useState("");
  const [resolved, setResolved] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const filteredOrders = useMemo(() => orders.filter((order) => `${order.id} ${order.customer} ${order.status}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const selected = resolutionOptions.find((option) => option.id === selectedResolution) || resolutionOptions[0];

  const chooseNav = (label: string) => {
    setActiveNav(label);
    if (label !== "Command center") toast(`${label} view is ready for your next workflow.`);
  };

  const applyResolution = () => {
    setResolved(true);
    setResolverOpen(false);
    toast.success(`Decision applied: ${selected.title}`, { description: "Audit log updated and fulfillment plan recalculated." });
  };

  return (
    <div className="min-h-screen bg-[#07101c] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(57,214,198,0.09),transparent_32%),radial-gradient(circle_at_100%_20%,rgba(99,102,241,0.10),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[url('/manus-storage/glassline-grid-texture_33402ae5.png')] bg-cover bg-center opacity-[0.10] mix-blend-screen" />

      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-white/[0.08] bg-[#081320]/95 px-4 py-5 backdrop-blur-2xl transition-transform duration-200`}>
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src="/manus-storage/glassline-logo_c19a3556.png" alt="Glassline Command" className="h-9 w-9" />
          <div><div className="font-display text-[15px] font-semibold tracking-tight text-white">Glassline</div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-300/80">Command</div></div>
          <button className="ml-auto rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={16} /></button>
        </div>
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => chooseNav(label)} className={`nav-item ${activeNav === label ? "nav-item-active" : ""}`}><Icon size={16} /> <span>{label}</span>{label === "Command center" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_#39d6c6]" />}</button>)}
        </nav>
        <div className="my-7 h-px bg-white/[0.07]" />
        <div className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Operations</div>
        <nav className="space-y-1">
          <button className="nav-item" onClick={() => toast("Exception queue opened.")}><ShieldAlert size={16} /><span>Exceptions</span><span className="ml-auto rounded-full bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200">7</span></button>
          <button className="nav-item" onClick={() => toast("Decision log exported as CSV.")}><Layers3 size={16} /><span>Decision log</span><Download className="ml-auto text-slate-600" size={14} /></button>
        </nav>
        <div className="mt-auto rounded-2xl border border-teal-300/10 bg-teal-300/[0.04] p-3.5"><div className="flex items-center gap-2 text-xs font-semibold text-teal-100"><CircleDot size={13} className="text-teal-300" /> Live system</div><p className="mt-2 text-[11px] leading-relaxed text-slate-500">All zones reporting. Last sync 18 seconds ago.</p><div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[94%] rounded-full bg-teal-300" /></div></div>
        <div className="mt-4 flex items-center gap-3 border-t border-white/[0.07] px-2 pt-4"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-semibold text-indigo-200">JM</div><div className="min-w-0"><div className="truncate text-xs font-semibold text-white">Jordan Miller</div><div className="text-[10px] text-slate-500">Warehouse manager</div></div><Settings2 size={15} className="ml-auto text-slate-600" /></div>
      </aside>

      <main className="relative min-h-screen lg:ml-[248px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/[0.07] bg-[#07101c]/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={18} /></button><div><div className="flex items-center gap-2 text-xs text-slate-500"><span>Operations</span><span>/</span><span className="text-slate-300">Command center</span></div><h1 className="mt-1 font-display text-lg font-semibold tracking-tight text-white">Good morning, Jordan <span className="text-slate-500">—</span> <span className="text-teal-300">all systems nominal</span></h1></div></div>
          <div className="flex items-center gap-2 sm:gap-3"><div className="relative hidden sm:block"><Search size={14} className="absolute left-3 top-2.5 text-slate-500" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders, SKUs…" className="h-9 w-48 border-white/10 bg-white/[0.04] pl-9 text-xs text-white placeholder:text-slate-600 focus-visible:ring-teal-300/40" /></div><button className="relative rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white" onClick={() => toast("No new notifications.")} aria-label="Notifications"><Bell size={16} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-300" /></button><button className="hidden rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-400 hover:text-white sm:block" onClick={() => toast("Command palette: try searching by order or SKU")} aria-label="Command palette"><Command size={16} /></button></div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_12px_#39d6c6]" /><span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200/80">Tuesday, August 18, 2026</span></div><div className="flex items-center gap-3"><div className="rounded-xl border border-teal-300/20 bg-teal-300/[0.07] p-2 text-teal-200"><PanelLeft size={18} /></div><h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Warehouse pulse</h2></div><p className="mt-2 max-w-xl text-sm text-slate-400">The operation is moving cleanly. One decision needs your attention before the next dispatch wave.</p></div><div className="flex gap-2"><Button variant="outline" className="border-white/10 bg-white/[0.04] text-xs text-slate-300 hover:bg-white/[0.08] hover:text-white" onClick={() => toast("Report exported to your downloads.")}><Download size={14} /> Export report</Button><Button className="bg-teal-300 text-[#07151b] shadow-[0_0_22px_rgba(57,214,198,0.18)] hover:bg-teal-200" onClick={() => setResolverOpen(true)}><Zap size={14} /> Review conflict</Button></div></div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Fill rate" value="96.8%" delta="+2.4%" icon={Gauge} tone="bg-teal-400/20" /><StatCard label="On-time dispatch" value="93.4%" delta="+1.8%" icon={Truck} tone="bg-indigo-400/20" /><StatCard label="Orders in motion" value="128" delta="+14" icon={PackageSearch} tone="bg-sky-400/20" /><StatCard label="Needs attention" value="07" delta="−3" icon={AlertTriangle} tone="bg-rose-400/20" /></div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.42fr)_minmax(360px,0.82fr)]">
            <section className="glass-panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4"><div><h3 className="font-display text-sm font-semibold text-white">Fulfillment flow</h3><p className="mt-1 text-xs text-slate-500">Live order distribution across today’s wave</p></div><div className="flex items-center gap-2"><button className="glass-button" onClick={() => toast("Filters applied: all zones")}><Filter size={13} /> All zones <ChevronDown size={12} /></button><button className="glass-icon-button" onClick={() => toast("Flow view refreshed")} aria-label="Refresh flow"><ScanLine size={15} /></button></div></div><div className="grid gap-4 p-5 sm:grid-cols-4">{[{label:"Created",value:"24",color:"bg-slate-400",pct:"19%"},{label:"Allocated",value:"31",color:"bg-indigo-300",pct:"32%"},{label:"Picking",value:"42",color:"bg-sky-300",pct:"49%"},{label:"Packing",value:"31",color:"bg-teal-300",pct:"37%"}].map((item) => <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"><div className="flex items-center justify-between text-xs text-slate-400"><span>{item.label}</span><span className="font-semibold text-slate-200">{item.value}</span></div><div className="mt-5 h-1.5 rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} /></div><div className="mt-2 text-[10px] text-slate-600">{item.pct} of active volume</div></div>)}</div><div className="border-t border-white/[0.07] px-5 py-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-300">Zone throughput</span><span className="text-[10px] text-slate-600">units / hour</span></div><div className="flex h-28 items-end gap-2 sm:gap-4">{[{zone:"A",value:66,height:"60%"},{zone:"B",value:84,height:"82%"},{zone:"C",value:53,height:"47%"},{zone:"Cold",value:72,height:"70%"},{zone:"High-value",value:91,height:"91%"},{zone:"Returns",value:38,height:"34%"}].map((bar) => <div className="flex flex-1 flex-col items-center gap-2" key={bar.zone}><div className="relative flex h-full w-full items-end"><div className="w-full rounded-t-md bg-gradient-to-t from-indigo-400/40 to-teal-300/80 transition-all duration-300 hover:from-indigo-300/60 hover:to-teal-200" style={{ height: bar.height }} /></div><span className="text-[10px] text-slate-500">{bar.zone}</span><span className="text-[10px] font-semibold text-slate-300">{bar.value}</span></div>)}</div></div></section>

            <section className={`glass-panel relative overflow-hidden border-teal-300/20 bg-[linear-gradient(145deg,rgba(23,66,73,0.38),rgba(11,24,38,0.72))] ${resolved ? "border-emerald-300/20" : ""}`}><div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl" /><div className="relative border-b border-white/[0.08] px-5 py-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-300/15 text-teal-200"><Sparkles size={15} /></div><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200">Intelligence alert</span></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${resolved ? "bg-emerald-300/10 text-emerald-200" : "bg-rose-300/10 text-rose-200"}`}>{resolved ? "Resolved" : "Action needed"}</span></div><h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-white">{resolved ? "Conflict resolved" : "SKU-X allocation conflict"}</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">{resolved ? "Order #10482 is protected. The lower-priority order has been partially reallocated and the audit trail is complete." : "Urgent order #10482 needs 10 units. Only 7 are available across the warehouse."}</p></div>{!resolved ? <><div className="relative grid grid-cols-3 gap-2 px-5 py-4"><div className="rounded-lg border border-white/[0.08] bg-black/10 p-2.5"><div className="text-[10px] text-slate-500">Required</div><div className="mt-1 font-display text-lg font-semibold text-white">10 <span className="text-xs font-normal text-slate-500">units</span></div></div><div className="rounded-lg border border-rose-300/15 bg-rose-300/[0.06] p-2.5"><div className="text-[10px] text-rose-200/70">Available</div><div className="mt-1 font-display text-lg font-semibold text-rose-100">7 <span className="text-xs font-normal text-rose-200/60">units</span></div></div><div className="rounded-lg border border-amber-300/15 bg-amber-300/[0.06] p-2.5"><div className="text-[10px] text-amber-200/70">At risk</div><div className="mt-1 font-display text-lg font-semibold text-amber-100">$1.2k</div></div></div><div className="relative mx-5 mb-4 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/10 px-3 py-2.5 text-[11px] text-slate-400"><Clock3 size={14} className="text-amber-200" /><span>Dispatch deadline in <strong className="text-white">01:42:18</strong></span><span className="ml-auto text-slate-600">Zone A</span></div><div className="relative mx-5 mb-4 rounded-lg border border-teal-300/10 bg-teal-300/[0.04] p-3 text-[11px] leading-relaxed text-slate-400"><span className="font-semibold text-teal-100">Why this ranks first:</span> protecting #10482 preserves the customer promise and returns the active wave to a safe SLA range.</div><button className="relative mx-5 mb-5 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-lg bg-teal-300 px-3.5 py-3 text-xs font-bold text-[#07151b] transition hover:bg-teal-200 active:scale-[0.98]" onClick={() => setResolverOpen(true)}>Open impact simulation <ArrowRight size={15} /></button></> : <div className="relative mx-5 mb-5 mt-5 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.06] p-3 text-xs text-emerald-100"><div className="flex items-center gap-2 font-semibold"><Check size={14} /> Best action applied</div><div className="mt-1 text-emerald-100/60">Decision ID GL-8421 · just now</div></div>}</section>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"><section className="glass-panel overflow-hidden"><div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h3 className="font-display text-sm font-semibold text-white">Priority queue</h3><p className="mt-1 text-xs text-slate-500">Orders sorted by SLA exposure and customer value</p></div><button className="text-xs font-semibold text-teal-300 hover:text-teal-200" onClick={() => chooseNav("Orders")}>View all <ArrowRight className="ml-1 inline" size={13} /></button></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-5 py-3 font-semibold">Order</th><th className="px-3 py-3 font-semibold">Priority</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">SLA</th><th className="px-5 py-3 text-right font-semibold">Value</th></tr></thead><tbody className="divide-y divide-white/[0.05]">{filteredOrders.map((order) => <tr key={order.id} className="group transition hover:bg-white/[0.025]"><td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-slate-400"><PackageSearch size={15} /></div><div><div className="text-xs font-semibold text-white">{order.id}</div><div className="mt-0.5 text-[11px] text-slate-500">{order.customer}</div></div></div></td><td className="px-3 py-3.5"><ToneBadge tone={order.tone}>{order.priority}</ToneBadge></td><td className="px-3 py-3.5"><span className="text-xs text-slate-300">{order.status}</span></td><td className="px-3 py-3.5"><div className={`flex items-center gap-1.5 text-xs ${order.tone === "rose" ? "text-rose-200" : "text-slate-400"}`}><Clock3 size={12} />{order.time}</div></td><td className="px-5 py-3.5 text-right text-xs font-semibold text-slate-200">{order.value}</td></tr>)}</tbody></table></div>{filteredOrders.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No orders match “{query}”.</div>}</section><section className="glass-panel"><div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4"><div><h3 className="font-display text-sm font-semibold text-white">Attention map</h3><p className="mt-1 text-xs text-slate-500">Exceptions by warehouse zone</p></div><button className="glass-icon-button" onClick={() => toast("Zone map detail opened")} aria-label="Open zone map"><ExternalLink size={14} /></button></div><div className="space-y-4 p-5">{[{zone:"Zone A",desc:"1 conflict · 2 low stock",value:"68%",tone:"bg-rose-300",text:"text-rose-200"},{zone:"Cold chain",desc:"2 delayed picks",value:"42%",tone:"bg-amber-300",text:"text-amber-200"},{zone:"High-value",desc:"All clear",value:"12%",tone:"bg-emerald-300",text:"text-emerald-200"}].map((item) => <div key={item.zone}><div className="flex items-center justify-between"><div><div className="text-xs font-semibold text-slate-200">{item.zone}</div><div className="mt-1 text-[11px] text-slate-500">{item.desc}</div></div><span className={`font-display text-sm font-semibold ${item.text}`}>{item.value}</span></div><div className="mt-2 h-1.5 rounded-full bg-white/[0.07]"><div className={`h-full rounded-full ${item.tone}`} style={{ width: item.value }} /></div></div>)}<div className="mt-2 rounded-lg border border-indigo-300/10 bg-indigo-300/[0.05] p-3 text-[11px] leading-relaxed text-indigo-100/70"><span className="font-semibold text-indigo-100">AI note:</span> Zone A is the only current SLA risk. Resolving the highlighted conflict returns the wave to a safe operating range.</div></div></section></div>
        </div>
      </main>

      {resolverOpen && !resolved && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"><div className="glass-panel max-h-[92vh] w-full max-w-3xl overflow-y-auto border-teal-300/20 bg-[#0b1a29]/95 shadow-2xl shadow-black/40"><div className="sticky top-0 z-10 flex items-start justify-between border-b border-white/[0.08] bg-[#0b1a29]/90 px-5 py-5 backdrop-blur-xl sm:px-7"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-200"><Sparkles size={14} /> Impact simulation</div><h2 className="mt-2 font-display text-xl font-semibold text-white sm:text-2xl">Choose how to resolve the conflict</h2><p className="mt-1 text-xs text-slate-400">Order #10482 · SKU-X · 3 units short · rank is based on predicted operational impact</p></div><button className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white" onClick={() => setResolverOpen(false)} aria-label="Close impact simulation"><X size={18} /></button></div><div className="grid gap-3 p-5 sm:p-7">{resolutionOptions.map((option) => <button key={option.id} onClick={() => setSelectedResolution(option.id)} className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 ${selectedResolution === option.id ? "border-teal-300/50 bg-teal-300/[0.08] shadow-[0_0_24px_rgba(57,214,198,0.08)]" : "border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"}`}><div className="flex items-start gap-3"><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${selectedResolution === option.id ? "bg-teal-300 text-[#07151b]" : "bg-white/[0.07] text-slate-400"}`}>{option.rank}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-white">{option.title}</span>{option.recommended && <span className="rounded-full bg-teal-300/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-200">Recommended</span>}</div><p className="mt-1 text-xs leading-relaxed text-slate-400">{option.detail}</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><div><div className="text-[9px] uppercase tracking-wider text-slate-600">Customer</div><div className="mt-1 text-xs font-semibold text-emerald-200">{option.satisfaction}</div></div><div><div className="text-[9px] uppercase tracking-wider text-slate-600">Revenue at risk</div><div className="mt-1 text-xs font-semibold text-slate-200">{option.revenue}</div></div><div><div className="text-[9px] uppercase tracking-wider text-slate-600">Op. cost</div><div className="mt-1 text-xs font-semibold text-slate-200">{option.cost}</div></div><div><div className="text-[9px] uppercase tracking-wider text-slate-600">SLA risk</div><div className={`mt-1 text-xs font-semibold ${option.sla === "Low" ? "text-emerald-200" : option.sla === "High" ? "text-rose-200" : "text-amber-200"}`}>{option.sla}</div></div></div></div><div className="hidden items-center gap-1 rounded-lg bg-white/[0.06] px-2 py-1 text-xs font-bold text-teal-200 sm:flex">{option.score}<span className="text-[9px] font-normal text-slate-500">impact</span></div></div></button>)}</div><div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:px-7"><div className="flex items-center gap-2 text-[11px] text-slate-500"><ShieldAlert size={14} className="text-amber-200" /> This action will be recorded in the audit log.</div><div className="flex gap-2"><Button variant="outline" className="flex-1 border-white/10 bg-white/[0.04] text-xs text-slate-300 sm:flex-none" onClick={() => setResolverOpen(false)}>Cancel</Button><Button className="flex-1 bg-teal-300 text-xs font-bold text-[#07151b] hover:bg-teal-200 sm:flex-none" onClick={applyResolution}>Apply {selected.rank} · {selected.title}</Button></div></div></div></div>}
    </div>
  );
}
