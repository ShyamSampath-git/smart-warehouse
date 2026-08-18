import { FormEvent, useEffect, useState } from "react";
import { Check, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type Region = { code: string; city: string; state: string; hubName: string };

type Props = {
  profile: any;
  regions: Region[];
  onSaved: () => Promise<void>;
  onSignOut: () => void;
  signingOut: boolean;
};

export function SyncedProfilePanel({ profile, regions, onSaved, onSignOut, signingOut }: Props) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    setName(profile.user.name || "Warehouse operator");
    setRegion(profile.profile.preferredRegionCode);
    setNotifications(profile.profile.operationalNotifications);
  }, [profile.user.name, profile.profile.preferredRegionCode, profile.profile.operationalNotifications]);

  const update = trpc.auth.updateProfile.useMutation({
    onSuccess: onSaved,
    onError: error => toast.error(error.message),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate({ name, preferredRegionCode: region, operationalNotifications: notifications });
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form className="glass-panel p-6 sm:p-7" onSubmit={submit}>
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-teal-300/20 bg-teal-300/[0.07] p-2 text-teal-200"><ShieldCheck size={18} /></div>
          <div><h3 className="font-display text-xl font-semibold text-white">My private profile</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Only your authenticated account can update this personal workspace configuration.</p></div>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-xs font-semibold text-slate-300">Display name<Input value={name} onChange={event => setName(event.target.value)} required minLength={2} className="auth-input" /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-300">Email address<Input value={profile.user.email || ""} disabled className="auth-input opacity-70" /></label>
          <label className="grid gap-2 text-xs font-semibold text-slate-300">Primary Indian hub<select value={region} onChange={event => setRegion(event.target.value)} className="auth-input">{regions.map(item => <option key={item.code} value={item.code}>{item.city}, {item.state}</option>)}</select></label>
          <div className="grid gap-2 text-xs font-semibold text-slate-300">Privacy level<div className="auth-input flex items-center gap-2 text-slate-300"><ShieldCheck size={15} className="text-teal-300" /> Private · account owner only</div></div>
        </div>
        <label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><div><div className="text-xs font-semibold text-white">Operational notifications</div><div className="mt-1 text-[11px] text-slate-500">Show alerts within your account workspace.</div></div><input type="checkbox" checked={notifications} onChange={event => setNotifications(event.target.checked)} className="h-4 w-4 accent-teal-300" /></label>
        <Button type="submit" disabled={update.isPending} className="mt-6 bg-teal-300 text-[#07151b] hover:bg-teal-200">{update.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save private profile</Button>
      </form>
      <aside className="glass-panel p-6"><ShieldCheck className="text-teal-300" /><h3 className="mt-4 font-display text-xl font-semibold text-white">Privacy boundary</h3><p className="mt-2 text-sm leading-6 text-slate-400">Your profile, warehouse actions, documents, and audit records are scoped to your account. Passwords are stored only as non-reversible hashes.</p><div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">Active region</div><div className="mt-2 text-sm font-semibold text-white">{regions.find(item => item.code === region)?.hubName || region}</div><div className="mt-1 text-xs text-slate-500">Asia/Kolkata · Indian Standard Time</div></div><Button variant="outline" disabled={signingOut} onClick={onSignOut} className="mt-6 w-full border-rose-300/20 bg-rose-300/[0.05] text-rose-200 hover:bg-rose-300/10 hover:text-rose-100"><LogOut size={14} /> Sign out securely</Button></aside>
    </div>
  );
}
