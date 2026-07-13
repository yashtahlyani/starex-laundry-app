"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { User, Phone, Mail, Lock, CheckCircle, LogOut, ArrowLeft } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as const;

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/auth"; return; }
      setUser(user);
      const meta = user.user_metadata;
      const { data: p } = await supabase.from("profiles").select("name, phone").eq("id", user.id).single();
      setProfile({ name: p?.name || meta?.full_name || meta?.name || "", phone: p?.phone || meta?.phone || "" });
      setLoading(false);
    });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = getSupabaseBrowser();
    await supabase.from("profiles").upsert({ id: user.id, name: profile.name, email: user.email, phone: profile.phone, role: "customer" }, { onConflict: "id" });
    await supabase.auth.updateUser({ data: { full_name: profile.name } });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.next.length < 6) { setPwMsg({ type: "err", text: "Password must be at least 6 characters." }); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: "err", text: "Passwords do not match." }); return; }
    setPwSaving(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwSaving(false);
    if (error) { setPwMsg({ type: "err", text: error.message }); return; }
    setPwMsg({ type: "ok", text: "Password updated successfully." });
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwMsg(null), 3000);
  }

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  const input = { width: "100%", padding: "12px 14px", border: "1.5px solid #E4E4E7", borderRadius: 10, fontFamily: "Kodchasan, sans-serif", fontSize: "0.9375rem", color: "#1F1B1B", background: "#FAFAFA", outline: "none", boxSizing: "border-box" as const };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FDFBFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "4px solid rgba(206,66,87,0.2)", borderTopColor: "#CE4257", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ background: "#FDFBFA", minHeight: "100vh", paddingTop: 96 }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 96px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div>
            <a href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#857C78", fontFamily: "Kodchasan, sans-serif", fontSize: "0.85rem", textDecoration: "none", marginBottom: 8 }}>
              <ArrowLeft size={14} /> Back to dashboard
            </a>
            <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.8rem", color: "#1F1B1B", letterSpacing: "-0.02em" }}>Account settings</h1>
          </div>
          <button onClick={handleSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "none", border: "1.5px solid #E4E4E7", borderRadius: 120, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#857C78" }}>
            <LogOut size={14} /> Sign out
          </button>
        </motion.div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4, ease }}
          style={{ background: "#fff", border: "1px solid #EDEDED", borderRadius: 20, padding: "28px 28px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(206,66,87,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={18} color="#A63446" />
            </div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1F1B1B" }}>Profile information</h2>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#1F1B1B", marginBottom: 6 }}>Full name</label>
              <input style={input} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#1F1B1B", marginBottom: 6 }}>Email address</label>
              <input style={{ ...input, background: "#F4F4F5", color: "#A1A1AA" }} value={user?.email ?? ""} readOnly />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#1F1B1B", marginBottom: 6 }}>Phone number</label>
              <input style={input} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (437) 607-7251" />
            </div>
            <button type="submit" disabled={saving}
              style={{ alignSelf: "flex-start", padding: "11px 24px", background: saving ? "#A1A1AA" : "#1F1B1B", color: "#fff", border: "none", borderRadius: 120, cursor: saving ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: 8 }}>
              {saved ? <><CheckCircle size={15} /> Saved!</> : saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </motion.div>

        {/* Password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4, ease }}
          style={{ background: "#fff", border: "1px solid #EDEDED", borderRadius: 20, padding: "28px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(206,66,87,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={18} color="#A63446" />
            </div>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1F1B1B" }}>Change password</h2>
          </div>

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#1F1B1B", marginBottom: 6 }}>New password</label>
              <input type="password" style={input} value={pwForm.next} onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", color: "#1F1B1B", marginBottom: 6 }}>Confirm new password</label>
              <input type="password" style={input} value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
            </div>
            {pwMsg && (
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: pwMsg.type === "ok" ? "#15803D" : "#991B1B", background: pwMsg.type === "ok" ? "#DCFCE7" : "#FEE2E2", padding: "10px 14px", borderRadius: 8 }}>
                {pwMsg.text}
              </p>
            )}
            <button type="submit" disabled={pwSaving}
              style={{ alignSelf: "flex-start", padding: "11px 24px", background: pwSaving ? "#A1A1AA" : "#1F1B1B", color: "#fff", border: "none", borderRadius: 120, cursor: pwSaving ? "not-allowed" : "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.875rem" }}>
              {pwSaving ? "Updating…" : "Update password"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
