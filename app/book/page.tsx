"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Clock, Shirt, Sparkles, Zap, Package } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

const ease = [0.25, 0.4, 0.25, 1] as const;

const services = [
  { id: "wash-fold",   icon: Shirt,    title: "Wash & Fold",      desc: "Everyday laundry",   price: "$2.50/lb",   color: "#E4F4FB" },
  { id: "express",     icon: Zap,      title: "Express Same-Day", desc: "Back by 6 PM",       price: "$3.50/lb",   color: "#D1F9E3" },
  { id: "dry-clean",   icon: Sparkles, title: "Dry Cleaning",     desc: "Delicates & formal", price: "From $12.99", color: "#FDF1E1" },
  { id: "ironing",     icon: Package,  title: "Ironing & Press",  desc: "Crisp & sharp",      price: "From $4.99", color: "#EAEDf9" },
];

const timeSlots = [
  "8:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",  "4:00 PM – 6:00 PM",   "6:00 PM – 8:00 PM",
];

const stepLabels = ["Service", "Schedule", "Details", "Confirm"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px",
  border: "1.5px solid #E4E4E7", borderRadius: 12,
  fontSize: "0.9375rem", color: "#09090B",
  fontFamily: "Kodchasan, sans-serif", outline: "none",
  background: "#ffffff", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Poppins, sans-serif",
  fontWeight: 600, fontSize: "0.875rem", color: "#09090B", marginBottom: 6,
};

type FormState = {
  service: string; date: string; time: string;
  name: string; email: string; phone: string; address: string; notes: string;
};

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ service: "", date: "", time: "", name: "", email: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setForm(p => ({
        ...p,
        name:  p.name  || user.user_metadata?.full_name || "",
        email: p.email || user.email || "",
      }));
    });
  }, []);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim());
  const validatePhone = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 10; };

  const validateDetails = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())        e.name    = "Please enter your full name";
    if (!validateEmail(form.email)) e.email  = "Enter a valid email";
    if (!validatePhone(form.phone)) e.phone  = "Enter a valid phone number";
    if (form.address.trim().length < 8) e.address = "Enter your full pickup address";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 2 && !validateDetails()) return;
    setErrors({});
    setDirection(1);
    setStep(s => s + 1);
  };
  const goBack = () => { setErrors({}); setDirection(-1); setStep(s => s - 1); };

  const selectedService = services.find(s => s.id === form.service);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: form.service,
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          date: form.date,
          timeSlot: form.time,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      setOrderId(data.orderCode);
      setDirection(1);
      setStep(4);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = [
    form.service !== "",
    form.date !== "" && form.time !== "",
    true,
    true,
  ][step] ?? true;

  const pageVariants = {
    initial: (d: number) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
    exit:    (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2, ease } }),
  };

  if (step === 4 && orderId) {
    return (
      <div style={{ background: "#F7F7F7", minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            style={{ width: 80, height: 80, background: "#D1F9E3", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#4ECDA0" />
          </motion.div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.25rem", color: "#09090B", marginBottom: 12, letterSpacing: "-0.025em" }}>Pickup confirmed!</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#D1F9E3", borderRadius: 999, padding: "7px 16px", marginBottom: 16 }}>
            <span style={{ color: "#0a3547", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Order {orderId}</span>
          </div>
          <p style={{ color: "#52525B", fontSize: "1.0625rem", maxWidth: "44ch", margin: "0 auto 12px", fontFamily: "Kodchasan, sans-serif" }}>
            We&apos;ll send a confirmation to <strong style={{ color: "#09090B" }}>{form.email}</strong>. See you on {form.date}!
          </p>
          <p style={{ color: "#71717A", fontSize: "0.875rem", marginBottom: 36, fontFamily: "Kodchasan, sans-serif" }}>Final price is confirmed after we weigh your laundry at pickup.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`/order?code=${orderId}`} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Track my order <ArrowRight size={16} />
            </a>
            <a href="/" className="btn-ghost">Back to Home</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F7F7F7", minHeight: "100vh", paddingTop: 80 }}>

      {/* Progress bar strip */}
      <div style={{ background: "#111921", paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {stepLabels.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#78EDB2" : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 20 }}>
            {stepLabels.map((s, i) => (
              <p key={s} style={{ fontSize: "0.75rem", fontFamily: "Kodchasan, sans-serif", fontWeight: i === step ? 700 : 400, color: i <= step ? "#78EDB2" : "rgba(255,255,255,0.3)" }}>{s}</p>
            ))}
          </div>
        </div>
      </div>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" }} className="book-layout">

          <AnimatePresence mode="wait" custom={direction}>

            {/* Step 0: Service */}
            {step === 0 && (
              <motion.div key="step0" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#09090B", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  What do you need <em className="display-accent" style={{ display: "inline" }}>cleaned?</em>
                </h2>
                <p style={{ color: "#52525B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Select the service that best fits your needs.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {services.map(s => {
                    const Icon = s.icon;
                    const selected = form.service === s.id;
                    return (
                      <button key={s.id} onClick={() => setForm(p => ({ ...p, service: s.id }))} style={{
                        padding: 20, border: `2px solid ${selected ? "#78EDB2" : "transparent"}`,
                        borderRadius: 16, background: selected ? s.color : "#ffffff",
                        cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                        boxShadow: selected ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                        <div style={{ width: 36, height: 36, background: selected ? "rgba(0,0,0,0.1)" : "#F4F4F5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                          <Icon size={17} color={selected ? "#0a3547" : "#52525B"} />
                        </div>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#09090B", marginBottom: 2 }}>{s.title}</p>
                        <p style={{ color: "#71717A", fontSize: "0.8125rem", marginBottom: 6, fontFamily: "Kodchasan, sans-serif" }}>{s.desc}</p>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#111921", fontSize: "0.875rem" }}>{s.price}</p>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 28 }}>
                  <button onClick={goNext} disabled={!canNext} className="btn-primary"
                    style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Schedule */}
            {step === 1 && (
              <motion.div key="step1" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#09090B", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  When should we <em className="display-accent" style={{ display: "inline" }}>come?</em>
                </h2>
                <p style={{ color: "#52525B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Choose a pickup date and time window.</p>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Pickup Date</label>
                  <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#78EDB2"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}><Clock size={13} style={{ display: "inline", marginRight: 6 }} />Time Window</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, time: t }))} style={{
                        padding: "10px 12px", border: `1.5px solid ${form.time === t ? "#78EDB2" : "#E4E4E7"}`,
                        borderRadius: 10, background: form.time === t ? "#D1F9E3" : "#ffffff",
                        color: form.time === t ? "#0a3547" : "#52525B",
                        fontFamily: "Kodchasan, sans-serif", fontWeight: form.time === t ? 700 : 500, fontSize: "0.8125rem",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={goNext} disabled={!canNext} className="btn-primary"
                    style={{ opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div key="step2" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#09090B", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Your <em className="display-accent" style={{ display: "inline" }}>details.</em>
                </h2>
                <p style={{ color: "#52525B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>We need to know where to come and how to reach you.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                  {([
                    { key: "name",    label: "Full name",      type: "text",  placeholder: "Jane Smith" },
                    { key: "email",   label: "Email address",  type: "email", placeholder: "jane@example.com" },
                    { key: "phone",   label: "Phone number",   type: "tel",   placeholder: "(416) 555-1234" },
                    { key: "address", label: "Pickup address", type: "text",  placeholder: "123 King St W, Toronto, ON M5H 1A1" },
                  ] as { key: keyof FormState; label: string; type: string; placeholder: string }[]).map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} value={form[key]} onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
                        placeholder={placeholder}
                        style={{ ...inputStyle, borderColor: errors[key] ? "#F87171" : "#E4E4E7", boxShadow: errors[key] ? "0 0 0 3px rgba(248,113,113,0.12)" : "none" }}
                        onFocus={e => { if (!errors[key]) (e.target as HTMLInputElement).style.borderColor = "#78EDB2"; }}
                        onBlur={e => { if (!errors[key]) (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"; }}
                      />
                      {errors[key] && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 5, fontFamily: "Kodchasan, sans-serif" }}>{errors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Special instructions <span style={{ color: "#71717A", fontWeight: 400, fontFamily: "Kodchasan, sans-serif" }}>(optional)</span></label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Buzzer code, fragile items, special requests…"
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#78EDB2"}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "#E4E4E7"}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={goNext} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Review Order <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div key="step3" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#09090B", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Ready to <em className="display-accent" style={{ display: "inline" }}>confirm?</em>
                </h2>
                <p style={{ color: "#52525B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Review your order details below.</p>

                <div style={{ background: "#D1F9E3", borderRadius: 16, padding: "24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  {([
                    { label: "Service", value: selectedService?.title },
                    { label: "Date",    value: form.date },
                    { label: "Time",    value: form.time },
                    { label: "Name",    value: form.name },
                    { label: "Email",   value: form.email },
                    { label: "Phone",   value: form.phone },
                    { label: "Address", value: form.address },
                    form.notes ? { label: "Notes", value: form.notes } : null,
                  ].filter(Boolean) as { label: string; value: string | undefined }[]).map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", gap: 16 }}>
                      <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#374151", minWidth: 80, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ color: "#09090B", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif", fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>

                <p style={{ color: "#71717A", fontSize: "0.8125rem", marginBottom: 20, fontFamily: "Kodchasan, sans-serif" }}>By confirming, you agree to our terms. Price confirmed via SMS after weigh-in.</p>

                {submitError && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#EF4444", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(10,26,15,0.3)", borderTopColor: "#0a1a0f", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                        Confirming…
                      </span>
                    ) : (
                      <>Confirm Pickup <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Summary sidebar */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{ background: "#111921", borderRadius: 20, padding: "28px" }}>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#ffffff", marginBottom: 20 }}>Order Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Service", value: selectedService?.title },
                  { label: "Date",    value: form.date || null },
                  { label: "Time",    value: form.time || null },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{label}</span>
                    <span style={{ color: value ? "#ffffff" : "rgba(255,255,255,0.2)", fontSize: "0.875rem", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{value || "—"}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>Starting from</span>
                    <span style={{ color: "#78EDB2", fontSize: "1rem", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>{selectedService?.price || "—"}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>Final price confirmed via SMS after weigh-in</p>
                </div>
              </div>
              <div style={{ marginTop: 20, background: "#D1F9E3", borderRadius: 10, padding: "11px 14px" }}>
                <p style={{ color: "#0a3547", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "Kodchasan, sans-serif" }}>Free pickup &amp; delivery on orders $15+</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) { .book-layout { grid-template-columns: 1fr !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
