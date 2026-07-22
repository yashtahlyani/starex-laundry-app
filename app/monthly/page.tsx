"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Star } from "lucide-react";
import { MEMBERSHIP, HST_LABEL } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;
const stepLabels = ["Plan", "Start Date", "Your Details", "Confirm"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px",
  border: "1.5px solid #E4E4E7", borderRadius: 12,
  fontSize: "0.9375rem", color: "#161616",
  fontFamily: "Kodchasan, sans-serif", outline: "none",
  background: "#ffffff", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Poppins, sans-serif",
  fontWeight: 600, fontSize: "0.875rem", color: "#161616", marginBottom: 6,
};

type FormState = { startDate: string; name: string; email: string; phone: string; address: string };

export default function MonthlyPlanPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ startDate: "", name: "", email: "", phone: "", address: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim());
  const validatePhone = (v: string) => v.replace(/\D/g, "").length >= 10;

  const validateDetails = () => {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = "Please enter your full name";
    if (!validateEmail(form.email)) e.email = "Enter a valid email";
    if (!validatePhone(form.phone)) e.phone = "Enter a valid phone number";
    if (form.address.trim().length < 8) e.address = "Enter your full address";
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

  const canNext = [true, form.startDate !== "", true, true][step] ?? true;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/monthly-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageVariants = {
    initial: (d: number) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
    exit:    (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2, ease } }),
  };

  if (submitted) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            style={{ width: 80, height: 80, background: "#F2F2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#8F2740" />
          </motion.div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.25rem", color: "#161616", marginBottom: 12, letterSpacing: "-0.025em" }}>Request received!</h2>
          <p style={{ color: "#6B6B6B", fontSize: "1.0625rem", maxWidth: "48ch", margin: "0 auto 12px", fontFamily: "Kodchasan, sans-serif" }}>
            We&apos;ll call or email <strong style={{ color: "#161616" }}>{form.email}</strong> within 1 business hour to confirm your {form.startDate} start date and set up payment for the Monthly Plan.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <a href="/" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Back to Home <ArrowRight size={16} />
            </a>
            <a href="/book" className="btn-ghost">Book a one-off pickup instead</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80 }}>

      {/* Progress bar strip */}
      <div style={{ background: "var(--brand)", paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 0" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {stepLabels.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#FFFFFF" : "rgba(255,255,255,0.25)", transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 20 }}>
            {stepLabels.map((s, i) => (
              <p key={s} style={{ fontSize: "0.75rem", fontFamily: "Kodchasan, sans-serif", fontWeight: i === step ? 700 : 400, color: i <= step ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>{s}</p>
            ))}
          </div>
        </div>
      </div>

      <section style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <AnimatePresence mode="wait" custom={direction}>

          {/* Step 0: Plan overview */}
          {step === 0 && (
            <motion.div key="step0" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <span className="eyebrow" style={{ color: "#8F2740" }}>StareX Monthly Plan</span>
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em", marginTop: 8 }}>
                Laundry on <em className="display-accent" style={{ display: "inline" }}>autopilot.</em>
              </h2>
              <p style={{ color: "#6B6B6B", marginBottom: 24, fontFamily: "Kodchasan, sans-serif" }}>
                One flat monthly rate, regular pickups, no per-order thinking.
              </p>
              <div style={{ background: "#F2F2F2", borderRadius: 20, padding: "28px" }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.5rem", color: "#161616", letterSpacing: "-0.025em", marginBottom: 4 }}>
                  ${MEMBERSHIP.monthlyPriceCad}<span style={{ fontSize: "1rem", fontWeight: 400, color: "#6B6B6B" }}>/month {HST_LABEL}</span>
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                  {MEMBERSHIP.perks.map(p => (
                    <li key={p} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Star size={14} color="#B8324F" style={{ flexShrink: 0, marginTop: 3 }} />
                      <span style={{ color: "#4A4A4A", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif" }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: 28 }}>
                <button onClick={goNext} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Get Started <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Start date */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                When should your plan <em className="display-accent" style={{ display: "inline" }}>start?</em>
              </h2>
              <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Your first pickup will be scheduled around this date.</p>
              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Preferred start date</label>
                <input type="date" value={form.startDate} min={new Date().toISOString().split("T")[0]}
                  onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  style={inputStyle}
                />
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
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Your <em className="display-accent" style={{ display: "inline" }}>details.</em>
              </h2>
              <p style={{ color: "#6B6B6B", marginBottom: 24, fontFamily: "Kodchasan, sans-serif" }}>So we can confirm your plan and arrange your first pickup.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
                {([
                  { key: "name",    label: "Full name",      type: "text",  placeholder: "Jane Smith" },
                  { key: "email",   label: "Email address",  type: "email", placeholder: "jane@example.com" },
                  { key: "phone",   label: "Phone number",   type: "tel",   placeholder: "(437) 607-7251" },
                  { key: "address", label: "Pickup address", type: "text",  placeholder: "123 Main St, Brampton, ON L6Y 1N7" },
                ] as { key: keyof FormState; label: string; type: string; placeholder: string }[]).map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[key]} onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: "" })); }}
                      placeholder={placeholder}
                      style={{ ...inputStyle, borderColor: errors[key] ? "#F87171" : "#E4E4E7" }}
                    />
                    {errors[key] && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 5, fontFamily: "Kodchasan, sans-serif" }}>{errors[key]}</p>}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                <button onClick={goNext} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Review <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                Confirm your <em className="display-accent" style={{ display: "inline" }}>plan.</em>
              </h2>
              <p style={{ color: "#6B6B6B", marginBottom: 24, fontFamily: "Kodchasan, sans-serif" }}>Review your details below.</p>

              <div style={{ background: "#F2F2F2", borderRadius: 16, padding: "24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Plan",    value: `${MEMBERSHIP.name} — $${MEMBERSHIP.monthlyPriceCad}/mo ${HST_LABEL}` },
                  { label: "Start",   value: form.startDate },
                  { label: "Name",    value: form.name },
                  { label: "Email",   value: form.email },
                  { label: "Phone",   value: form.phone },
                  { label: "Address", value: form.address },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", gap: 16 }}>
                    <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#4A4A4A", minWidth: 80, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                    <span style={{ color: "#161616", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 20, fontFamily: "Kodchasan, sans-serif" }}>
                This submits a plan request — we&apos;ll call or email you within 1 business hour to confirm your start date and arrange payment. Nothing is charged yet.
              </p>

              {submitError && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#EF4444", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
                  {submitError}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#FFFFFF", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                      Submitting…
                    </span>
                  ) : (
                    <>Request Monthly Plan <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
