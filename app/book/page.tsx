"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Clock, Shirt, Sparkles, Zap, Package, Home, Car } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { CATALOG, MINIMUM_ORDER, HST_LABEL } from "@/lib/pricing";

const ease = [0.25, 0.4, 0.25, 1] as const;

const services = [
  { id: "wash-fold",   icon: Shirt,    title: "Wash & Fold",         desc: "Everyday laundry",         price: "$2/lb",       color: "#EDEDED" },
  { id: "express",     icon: Zap,      title: "Same-Day Express",    desc: "Wash & Fold only",          price: "$3/lb",       color: "#F2F2F2" },
  { id: "dry-clean",   icon: Sparkles, title: "Dry Cleaning",        desc: "Delicates & formal",        price: "From $6.99",  color: "#EAEAEA" },
  { id: "ironing",     icon: Package,  title: "Ironing & Press",     desc: "Crisp & sharp",             price: "From $1.99",  color: "#E5E5E5" },
  { id: "household",   icon: Home,     title: "Household Items",     desc: "Duvets, curtains, rugs",    price: "From $9.99",  color: "#EDEDED" },
  { id: "detailing",   icon: Car,      title: "Car & Sofa Detailing", desc: "Priced on inspection",     price: "From $199",   color: "#F2F2F2" },
];

// Dry cleaning and household/bedding items overlap a lot (blankets, curtains,
// rugs can go either way) — when a customer is looking at Dry Cleaning prices,
// show the Household catalog right alongside it so they don't have to guess
// or leave the booking flow to check.
const CATALOG_FOR_SERVICE: Record<string, string[]> = {
  "dry-clean": ["dry-clean", "household"],
  "ironing":   ["ironing"],
  "household": ["household", "dry-clean"],
};

const timeSlots = [
  "8:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "12:00 PM – 2:00 PM",
  "2:00 PM – 4:00 PM",  "4:00 PM – 6:00 PM",   "6:00 PM – 8:00 PM",
];

const stepLabels = ["Service", "Schedule", "Details", "Confirm"];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px",
  border: "1.5px solid #E4E4E7", borderRadius: 12,
  fontSize: "0.9375rem", color: "#161616",
  fontFamily: "Kodchasan, sans-serif", outline: "none",
  background: "#ffffff", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "Poppins, sans-serif",
  fontWeight: 600, fontSize: "0.875rem", color: "#161616", marginBottom: 6,
};

type FormState = {
  service: string; date: string; time: string;
  name: string; email: string; phone: string; address: string; notes: string;
};

function BookPageInner() {
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const validPreselect = services.some(s => s.id === preselectedService) ? preselectedService! : "";

  // Arriving from a specific service's "Book this service" CTA — skip the
  // service-selection step entirely since it's already chosen, straight to Schedule.
  const [step, setStep] = useState(validPreselect ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ service: validPreselect, date: "", time: "", name: "", email: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            style={{ width: 80, height: 80, background: "#F2F2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#8F2740" />
          </motion.div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.25rem", color: "#161616", marginBottom: 12, letterSpacing: "-0.025em" }}>Pickup confirmed!</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F2F2F2", borderRadius: 999, padding: "7px 16px", marginBottom: 16 }}>
            <span style={{ color: "#8F2740", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Order {orderId}</span>
          </div>
          <p style={{ color: "#6B6B6B", fontSize: "1.0625rem", maxWidth: "44ch", margin: "0 auto 12px", fontFamily: "Kodchasan, sans-serif" }}>
            We&apos;ll send a confirmation to <strong style={{ color: "#161616" }}>{form.email}</strong>. See you on {form.date}!
          </p>
          <p style={{ color: "#8C8C8C", fontSize: "0.875rem", marginBottom: 36, fontFamily: "Kodchasan, sans-serif" }}>Final price is confirmed after we weigh your laundry at pickup.</p>
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
    <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80 }}>

      {/* Progress bar strip */}
      <div style={{ background: "var(--brand)", paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 0" }}>
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

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" }} className="book-layout">

          <AnimatePresence mode="wait" custom={direction}>

            {/* Step 0: Service */}
            {step === 0 && (
              <motion.div key="step0" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  What do you need <em className="display-accent" style={{ display: "inline" }}>cleaned?</em>
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Select the service that best fits your needs.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                  {services.map(s => {
                    const Icon = s.icon;
                    const selected = form.service === s.id;
                    return (
                      <button key={s.id} onClick={() => setForm(p => ({ ...p, service: s.id }))} style={{
                        padding: 20, border: `2px solid ${selected ? "#B8324F" : "transparent"}`,
                        borderRadius: 16, background: selected ? s.color : "#ffffff",
                        cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                        boxShadow: selected ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                      }}>
                        <div style={{ width: 36, height: 36, background: selected ? "rgba(0,0,0,0.1)" : "#F4F4F5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                          <Icon size={17} color={selected ? "#8F2740" : "#6B6B6B"} />
                        </div>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 2 }}>{s.title}</p>
                        <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 6, fontFamily: "Kodchasan, sans-serif" }}>{s.desc}</p>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#161616", fontSize: "0.875rem" }}>{s.price}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Inline price list — shown right here so customers never have to
                    leave the booking flow to check what dry-clean/ironing/household
                    items cost. */}
                {CATALOG_FOR_SERVICE[form.service] && (
                  <div style={{ marginTop: 24, background: "#FAFAFA", borderRadius: 16, padding: "20px 22px" }}>
                    {CATALOG_FOR_SERVICE[form.service].map(catId => {
                      const tab = CATALOG.find(t => t.id === catId);
                      if (!tab) return null;
                      return (
                        <div key={catId} style={{ marginBottom: 16 }}>
                          <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#8F2740", marginBottom: 10 }}>
                            {catId === form.service ? tab.label : `Also dry-cleanable: ${tab.label}`}
                          </p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "4px 20px" }} className="book-catalog-grid">
                            {tab.sections.flatMap(s => s.items).map(item => (
                              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: "1px solid #EFEFEF" }}>
                                <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8125rem", color: "#4A4A4A" }}>{item.name}</span>
                                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8125rem", color: "#161616", whiteSpace: "nowrap" }}>
                                  {item.from ? "From " : ""}${item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#8C8C8C", marginTop: 4 }}>
                      Prices shown {HST_LABEL}. ${MINIMUM_ORDER.standardCad} minimum order value applies.
                    </p>
                  </div>
                )}

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
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  When should we <em className="display-accent" style={{ display: "inline" }}>come?</em>
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Choose a pickup date and time window.</p>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />Pickup Date</label>
                  <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#B8324F"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}><Clock size={13} style={{ display: "inline", marginRight: 6 }} />Time Window</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                    {timeSlots.map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, time: t }))} style={{
                        padding: "10px 12px", border: `1.5px solid ${form.time === t ? "#B8324F" : "#E4E4E7"}`,
                        borderRadius: 10, background: form.time === t ? "#F2F2F2" : "#ffffff",
                        color: form.time === t ? "#8F2740" : "#6B6B6B",
                        fontFamily: "Kodchasan, sans-serif", fontWeight: form.time === t ? 700 : 500, fontSize: "0.8125rem",
                        cursor: "pointer", transition: "all 0.15s",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                <p style={{ color: "#6B6B6B", marginBottom: 12, fontFamily: "Kodchasan, sans-serif" }}>We need to know where to come and how to reach you.</p>
                <p style={{ display: "inline-block", color: "#B93A57", background: "#FDF0F2", border: "1px solid rgba(184,50,79,0.18)", borderRadius: 999, padding: "5px 14px", fontSize: "0.8125rem", fontWeight: 600, marginBottom: 24, fontFamily: "Kodchasan, sans-serif" }}>
                  No account needed — book as a guest, or <a href="/auth" style={{ color: "inherit", textDecoration: "underline" }}>sign in</a> to track orders in one place.
                </p>

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
                        style={{ ...inputStyle, borderColor: errors[key] ? "#F87171" : "#E4E4E7", boxShadow: errors[key] ? "0 0 0 3px rgba(248,113,113,0.12)" : "none" }}
                        onFocus={e => { if (!errors[key]) (e.target as HTMLInputElement).style.borderColor = "#B8324F"; }}
                        onBlur={e => { if (!errors[key]) (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"; }}
                      />
                      {errors[key] && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: 5, fontFamily: "Kodchasan, sans-serif" }}>{errors[key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Special instructions <span style={{ color: "#8C8C8C", fontWeight: 400, fontFamily: "Kodchasan, sans-serif" }}>(optional)</span></label>
                    <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="Buzzer code, fragile items, special requests…"
                      style={{ ...inputStyle, resize: "vertical" }}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#B8324F"}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "#E4E4E7"}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Ready to <em className="display-accent" style={{ display: "inline" }}>confirm?</em>
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Review your order details below.</p>

                <div style={{ background: "#F2F2F2", borderRadius: 16, padding: "24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
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
                      <span style={{ fontFamily: "Kodchasan, sans-serif", fontWeight: 700, fontSize: "0.7rem", color: "#4A4A4A", minWidth: 80, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
                      <span style={{ color: "#161616", fontSize: "0.9rem", fontFamily: "Kodchasan, sans-serif", fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>

                <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>
                  Price confirmed via SMS after weigh-in. Prices shown {HST_LABEL}. ${MINIMUM_ORDER.standardCad} minimum order value applies (${MINIMUM_ORDER.detailingCad} for Car & Sofa Detailing).
                </p>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
                  <input
                    type="checkbox" checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: "#B8324F", flexShrink: 0, cursor: "pointer" }}
                  />
                  <span style={{ color: "#4A4A4A", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif", lineHeight: 1.5 }}>
                    I've read and accept StareX's <a href="/terms" target="_blank" style={{ color: "#8F2740", textDecoration: "underline" }}>Terms &amp; Conditions</a>.
                  </span>
                </label>

                {submitError && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#EF4444", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
                    {submitError}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleSubmit} disabled={submitting || !termsAccepted} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: (submitting || !termsAccepted) ? 0.5 : 1, cursor: (submitting || !termsAccepted) ? "not-allowed" : "pointer" }}>
                    {submitting ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(10,26,15,0.3)", borderTopColor: "#FFFFFF", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
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
            <div style={{ background: "#ffffff", border: "1px solid rgba(20,20,20,0.08)", borderRadius: 20, padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 20 }}>Order Summary</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Service", value: selectedService?.title },
                  { label: "Date",    value: form.date || null },
                  { label: "Time",    value: form.time || null },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8C8C8C", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{label}</span>
                    <span style={{ color: value ? "#161616" : "#C4BCB8", fontSize: "0.875rem", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{value || "—"}</span>
                  </div>
                ))}
                <div style={{ borderTop: "1px solid rgba(20,20,20,0.08)", paddingTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#8C8C8C", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>Starting from</span>
                    <span style={{ color: "#B8324F", fontSize: "1rem", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>{selectedService?.price || "—"}</span>
                  </div>
                  <p style={{ color: "#8C8C8C", fontSize: "0.75rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>Final price confirmed via SMS after weigh-in. Prices shown {HST_LABEL}.</p>
                </div>
              </div>
              <div style={{ marginTop: 20, background: "#F2F2F2", borderRadius: 10, padding: "11px 14px" }}>
                <p style={{ color: "#8F2740", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "Kodchasan, sans-serif" }}>
                  {form.service === "detailing"
                    ? `$${MINIMUM_ORDER.detailingCad} minimum order value`
                    : `$${MINIMUM_ORDER.standardCad} minimum order value`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) { .book-layout { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .book-catalog-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#FFFFFF" }} />}>
      <BookPageInner />
    </Suspense>
  );
}
