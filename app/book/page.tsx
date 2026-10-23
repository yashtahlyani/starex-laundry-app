"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, Calendar, Clock, Shirt, Sparkles, Zap, Package, Home, Car, Wind } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import {
  CATALOG, CATALOG_FOR_SERVICE, MINIMUM_ORDER, HST_LABEL, DRY_CLEAN_COMBO,
  buildEstimate, formatEstimateNote, isPerItemService, isPerLbService,
  type ItemSelection,
} from "@/lib/pricing";
import { getSource } from "@/lib/attribution";
import StripeCardStep, { type SavedCard } from "@/components/StripeCardStep";
import EstimateBill from "@/components/EstimateBill";
import TrustBadge from "@/components/TrustBadge";
import ItemPicker from "@/components/ItemPicker";
import WeightPicker from "@/components/WeightPicker";

const ease = [0.25, 0.4, 0.25, 1] as const;

const services = [
  { id: "wash-fold",   icon: Shirt,    title: "Wash & Fold",         desc: "Everyday laundry",         price: "$2/lb",       color: "#EDEDED" },
  { id: "express",     icon: Zap,      title: "Same-Day Express",    desc: "Wash & Fold only",          price: "$3/lb",       color: "#F2F2F2" },
  { id: "wash-press",  icon: Wind,     title: "Wash & Press",        desc: "Washed & ironed, by weight", price: "$5/lb",      color: "#F2F2F2" },
  { id: "dry-clean",   icon: Sparkles, title: "Dry Cleaning",        desc: "Delicates & formal",        price: "From $4.99",  color: "#EAEAEA" },
  { id: "ironing",     icon: Package,  title: "Ironing & Press",     desc: "Crisp & sharp",             price: "From $1.99",  color: "#E5E5E5" },
  { id: "household",   icon: Home,     title: "Household Items",     desc: "Duvets, curtains, rugs",    price: "From $9.99",  color: "#EDEDED" },
  { id: "detailing",   icon: Car,      title: "Car & Sofa Detailing", desc: "Priced on inspection",     price: "From $200",   color: "#F2F2F2" },
];

// CATALOG_FOR_SERVICE now lives in lib/pricing.ts — the estimator needs the
// same mapping to know which tabs a service can be priced from, and two copies
// would drift.

// 3-hour pickup windows (per client request, matching the Laundry Lady site).
// startHour is used to hide windows that have already begun when the
// customer is booking for today — otherwise someone booking at 6 PM could
// still pick the 8–11 AM slot from earlier that same day.
const timeSlots = [
  { label: "8:00 AM – 11:00 AM", startHour: 8 },
  { label: "11:00 AM – 2:00 PM", startHour: 11 },
  { label: "2:00 PM – 5:00 PM",  startHour: 14 },
  { label: "5:00 PM – 8:00 PM",  startHour: 17 },
];

// Car & Sofa Detailing uses half-day appointment windows instead of the
// standard 3-hour pickup windows — a detailer visit runs longer than a
// laundry pickup (per client, 2026-09-06).
const detailingTimeSlots = [
  { label: "8:00 AM – 1:00 PM", startHour: 8 },
  { label: "1:00 PM – 6:00 PM", startHour: 13 },
];

// Car & Sofa Detailing is quoted on inspection, so it has nothing to estimate
// and skips that step — which means the step list is per-service, not fixed.
// Steps are addressed by id everywhere below; indices shift.
type StepId = "service" | "estimate" | "schedule" | "details" | "confirm";

function stepsFor(serviceId: string): StepId[] {
  const skipEstimate = serviceId === "detailing";
  return skipEstimate
    ? ["service", "schedule", "details", "confirm"]
    : ["service", "estimate", "schedule", "details", "confirm"];
}

function stepLabel(id: StepId, serviceId: string): string {
  if (id === "estimate") return isPerLbService(serviceId) ? "Weight" : "Items";
  return { service: "Service", schedule: "Schedule", details: "Details", confirm: "Confirm" }[id];
}

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
  const comboParam = searchParams.get("combo") === "1";

  // Arriving from a specific service's "Book this service" CTA — skip the
  // service-selection step entirely since it's already chosen, straight to Schedule.
  const [step, setStep] = useState(validPreselect ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<FormState>({ service: validPreselect, date: "", time: "", name: "", email: "", phone: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  // Arrived from the Offer page / pricing combo CTA — surface this through
  // the whole flow (sidebar, review, confirmation) so the customer never
  // loses track of "am I actually getting the combo?" once they leave /offer.
  // Tied to the live selected service, not just the initial URL param, so if
  // the customer goes back and picks a different service the combo styling
  // correctly disappears rather than sticking around inaccurately.
  // Opt-in starts from the URL param but is switchable in the flow. Previously
  // the combo existed only for people who arrived from /offer — someone who
  // picked "Dry Cleaning" off the service grid was never offered it, and one
  // customer paid $100 for 9 garments that way (per client, 2026-09-29).
  const [comboOptIn, setComboOptIn] = useState(comboParam);
  const isCombo = comboOptIn && form.service === "dry-clean";
  const [submitting, setSubmitting] = useState(false);

  // What the customer has picked, so the bill can be shown before they order
  // (per client, 2026-10-13). Selection is keyed by catalog tab + item name —
  // "Sleeping Bag" exists in two tabs at two different prices.
  const [selection, setSelection] = useState<ItemSelection>({});
  const [weightLbs, setWeightLbs] = useState<number | null>(null);

  const stepIds = stepsFor(form.service);
  // Guard against the list shrinking under us: picking Detailing after having
  // gone further removes a step, and a stale index would land past the end.
  const stepIndex = Math.min(step, stepIds.length - 1);
  const current = stepIds[stepIndex];

  const estimate = buildEstimate({ serviceId: form.service, selection, weightLbs, isCombo });
  // The same basket priced without the combo, so the flow can admit when the
  // combo it is pushing would actually cost more (small baskets: the flat $50
  // sits above the $40 minimum).
  const comboCostsMore = isCombo && !estimate.isEmpty && (estimate.comboSavingCad ?? 0) < 0;

  // Hide pickup windows that have already started when booking for today —
  // otherwise someone booking this evening could still pick this morning's slot.
  // Uses the browser's local date/time (not UTC) to match the <input type="date">
  // value, which is itself always local.
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const currentHour = now.getHours() + now.getMinutes() / 60;
  // Detailing gets its own half-day windows; Same-Day Express only offers the
  // two earliest pickup windows so there's enough of the day left to actually
  // turn it around same-day (per client, 2026-09-06).
  const baseTimeSlots = form.service === "detailing" ? detailingTimeSlots
    : form.service === "express" ? timeSlots.slice(0, 2)
    : timeSlots;
  const availableTimeSlots = form.date === todayStr
    ? baseTimeSlots.filter(s => s.startHour > currentHour)
    : baseTimeSlots;

  useEffect(() => {
    if (form.time && !availableTimeSlots.some(s => s.label === form.time)) {
      setForm(p => ({ ...p, time: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, form.service]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);

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
    if (current === "schedule" && form.date && form.date < todayStr) {
      setErrors({ date: "That date has already passed — please choose today or later" });
      return;
    }
    if (current === "details" && !validateDetails()) return;
    setErrors({});
    setDirection(1);
    setStep(() => stepIndex + 1);
  };
  const goBack = () => { setErrors({}); setDirection(-1); setStep(() => Math.max(0, stepIndex - 1)); };

  const selectedService = services.find(s => s.id === form.service);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Combo context has to travel with the order itself, not just live on
      // this page — otherwise the admin has no way to know this dry-clean
      // order should be $50 flat instead of itemized. Prepending it to notes
      // means it shows up in the admin drawer, the CSV export, and the
      // customer's own status history.
      const comboNote = `Booked via ${DRY_CLEAN_COMBO.tagline} combo offer (${DRY_CLEAN_COMBO.pieceCount} pieces, $${DRY_CLEAN_COMBO.priceCad} flat).`;
      const combinedNotes = isCombo ? [comboNote, form.notes.trim()].filter(Boolean).join(" — ") : form.notes;
      // What the customer was shown before they pressed the button. Travels
      // with the order so staff can see the expectation they're confirming
      // against — a $45 estimate and a $120 weigh-in is a conversation worth
      // having at the door, not on the invoice.
      const estimateNote = formatEstimateNote(estimate, form.service);
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
          notes: combinedNotes || undefined,
          estimateNote: estimateNote ?? undefined,
          stripeCustomerId: savedCard?.stripeCustomerId,
          stripePaymentMethodId: savedCard?.stripePaymentMethodId,
          cardBrand: savedCard?.cardBrand,
          cardLast4: savedCard?.cardLast4,
          // How this visitor found us, captured on their first page view.
          source: getSource() ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      setOrderId(data.orderCode);
      setDirection(1);
      setDone(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // `min` on a date input only constrains the picker UI — a date typed straight
  // into the field still lands in state and submits. The server rejects it, but
  // the customer shouldn't reach that point to find out.
  // The estimate step is deliberately skippable: staff count and weigh
  // everything at pickup anyway, so forcing an exact item list before someone
  // can book would add friction to no purpose.
  const canNext = {
    service:  form.service !== "",
    estimate: true,
    schedule: form.date !== "" && form.date >= todayStr && form.time !== "",
    details:  true,
    confirm:  true,
  }[current] ?? true;

  const pageVariants = {
    initial: (d: number) => ({ opacity: 0, x: d * 40 }),
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
    exit:    (d: number) => ({ opacity: 0, x: d * -40, transition: { duration: 0.2, ease } }),
  };

  if (done && orderId) {
    return (
      <div style={{ background: "#FFFFFF", minHeight: "100vh", paddingTop: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            style={{ width: 80, height: 80, background: "#F2F2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} color="#B30F14" />
          </motion.div>
          <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.25rem", color: "#161616", marginBottom: 12, letterSpacing: "-0.025em" }}>Pickup confirmed!</h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F2F2F2", borderRadius: 999, padding: "7px 16px", marginBottom: 16 }}>
            <span style={{ color: "#B30F14", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>Order {orderId}</span>
          </div>
          {isCombo && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg,#F4524D,#ED1D24)", color: "#FFFFFF", borderRadius: 999, padding: "6px 16px", marginBottom: 16, marginLeft: 8 }}>
              <Sparkles size={13} />
              <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.82rem" }}>{DRY_CLEAN_COMBO.tagline} combo confirmed</span>
            </div>
          )}
          <p style={{ color: "#6B6B6B", fontSize: "1.0625rem", maxWidth: "44ch", margin: "0 auto 12px", fontFamily: "Kodchasan, sans-serif" }}>
            We&apos;ll send a confirmation to <strong style={{ color: "#161616" }}>{form.email}</strong>. See you on {form.date}!
          </p>
          <p style={{ color: "#8C8C8C", fontSize: "0.875rem", marginBottom: 36, fontFamily: "Kodchasan, sans-serif" }}>
            {isCombo
              ? `Bring your ${DRY_CLEAN_COMBO.pieceCount} pieces — flat $${DRY_CLEAN_COMBO.priceCad}, confirmed at pickup.`
              : "Final price is confirmed after we weigh your laundry at pickup."}
          </p>
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
            {stepIds.map((s, i) => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= stepIndex ? "#FFFFFF" : "rgba(255,255,255,0.25)", transition: "background 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 20 }}>
            {stepIds.map((s, i) => (
              <p key={s} style={{ fontSize: "0.75rem", fontFamily: "Kodchasan, sans-serif", fontWeight: i === stepIndex ? 700 : 400, color: i <= stepIndex ? "#FFFFFF" : "rgba(255,255,255,0.55)" }}>{stepLabel(s, form.service)}</p>
            ))}
          </div>
        </div>
      </div>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>
        {isCombo && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
            background: "linear-gradient(135deg,#F4524D,#ED1D24)", borderRadius: 14,
            padding: "13px 18px", color: "#FFFFFF",
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.875rem" }}>
              {DRY_CLEAN_COMBO.tagline} Combo — you&apos;re booking {DRY_CLEAN_COMBO.pieceCount} pieces for a flat ${DRY_CLEAN_COMBO.priceCad}, not itemized pricing. A 2-piece suit counts as 2.
            </span>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" }} className="book-layout">

          <AnimatePresence mode="wait" custom={direction}>

            {/* Step: Service */}
            {current === "service" && (
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
                      <button
                        key={s.id}
                        onClick={() => {
                          // Selecting a service is the confirmation — advance
                          // straight to Schedule instead of making the
                          // customer select, then separately tap Continue.
                          setForm(p => ({ ...p, service: s.id }));
                          setTimeout(goNext, 220);
                        }}
                        style={{
                          padding: 20, border: `2px solid ${selected ? "#ED1D24" : "transparent"}`,
                          borderRadius: 16, background: selected ? s.color : "#ffffff",
                          cursor: "pointer", textAlign: "left", transition: "all 0.2s ease",
                          boxShadow: selected ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                        }}>
                        <div style={{ width: 36, height: 36, background: selected ? "rgba(0,0,0,0.1)" : "#F4F4F5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                          <Icon size={17} color={selected ? "#B30F14" : "#6B6B6B"} />
                        </div>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 2 }}>{s.title}</p>
                        <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 6, fontFamily: "Kodchasan, sans-serif" }}>{s.desc}</p>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, color: "#161616", fontSize: "0.875rem" }}>{s.price}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step: Items / Weight — the estimated bill the client asked for */}
            {current === "estimate" && (
              <motion.div key="stepEstimate" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  {isPerLbService(form.service)
                    ? <>How much <em className="display-accent" style={{ display: "inline" }}>laundry?</em></>
                    : <>What are we <em className="display-accent" style={{ display: "inline" }}>cleaning?</em></>}
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 24, fontFamily: "Kodchasan, sans-serif" }}>
                  {isPerLbService(form.service)
                    ? "Pick the closest size and we'll show your estimated bill. We weigh everything at pickup."
                    : "Add your pieces to see the bill before you book. You can change anything at pickup."}
                </p>

                {isPerLbService(form.service) ? (
                  <WeightPicker serviceId={form.service} weightLbs={weightLbs} onChange={setWeightLbs} />
                ) : (
                  <ItemPicker serviceId={form.service} selection={selection} onChange={setSelection} />
                )}

                {/* The bill, inline — the sidebar is below the fold on a phone,
                    and the whole point of this step is seeing the number. */}
                <div style={{ marginTop: 28, background: "#F8F8F8", border: "1px solid rgba(20,20,20,0.08)", borderRadius: 16, padding: "20px 22px" }}>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#161616", marginBottom: 14 }}>
                    Your estimated bill
                  </p>
                  <EstimateBill estimate={estimate} />
                </div>

                {comboCostsMore && (
                  <div style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 12, background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "14px 16px" }}>
                    <Sparkles size={17} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#92400E", margin: 0 }}>
                        The combo costs ${Math.abs(estimate.comboSavingCad ?? 0).toFixed(2)} more for what you&apos;ve picked.
                      </p>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", color: "#92400E", margin: "4px 0 10px", lineHeight: 1.55 }}>
                        The {DRY_CLEAN_COMBO.tagline} deal is a flat ${DRY_CLEAN_COMBO.priceCad}, which is above the
                        ${MINIMUM_ORDER.standardCad} minimum — so on a smaller basket you&apos;d pay less item by item.
                        Add a few more pieces and it turns in your favour.
                      </p>
                      <button
                        type="button"
                        onClick={() => setComboOptIn(false)}
                        style={{ background: "#92400E", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "7px 16px", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8rem" }}
                      >
                        Drop the combo, price my items
                      </button>
                    </div>
                  </div>
                )}

                {!isCombo && form.service === "dry-clean" && !estimate.isEmpty && (() => {
                  const withCombo = buildEstimate({ serviceId: form.service, selection, isCombo: true });
                  const saving = estimate.total - withCombo.total;
                  if (saving <= 0.01) return null;
                  return (
                    <div style={{ marginTop: 16, display: "flex", alignItems: "flex-start", gap: 12, background: "#FFF5F6", border: "1.5px solid rgba(184,50,79,0.25)", borderLeft: "5px solid #ED1D24", borderRadius: 14, padding: "14px 16px" }}>
                      <Sparkles size={17} color="#B30F14" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#161616", margin: 0 }}>
                          Add the {DRY_CLEAN_COMBO.tagline} combo and save ${saving.toFixed(2)}.
                        </p>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", color: "#6B6B6B", margin: "4px 0 10px", lineHeight: 1.55 }}>
                          Your {estimate.itemCount} piece{estimate.itemCount === 1 ? "" : "s"} would come to ${estimate.total.toFixed(2)};
                          with the combo it&apos;s ${withCombo.total.toFixed(2)}.
                        </p>
                        <button
                          type="button"
                          onClick={() => setComboOptIn(true)}
                          style={{ background: "#ED1D24", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "7px 16px", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.8rem" }}
                        >
                          Add the combo
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={goNext} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {estimate.isEmpty ? "Skip — price at pickup" : "Continue"} <ArrowRight size={16} />
                  </button>
                </div>

                {/* On a phone the catalog is long and both the inline bill and
                    the sidebar sit well below the fold — so the running total
                    follows you down the list. Desktop already has the sticky
                    sidebar, so this is mobile-only. */}
                {!estimate.isEmpty && (
                  <div className="book-sticky-total">
                    <div>
                      <p style={{ margin: 0, fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#8C8C8C" }}>
                        {estimate.mode === "weight"
                          ? `About ${weightLbs} lb`
                          : `${estimate.itemCount} piece${estimate.itemCount === 1 ? "" : "s"}`} · estimated
                      </p>
                      <p style={{ margin: 0, fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#ED1D24" }}>
                        ${estimate.total.toFixed(2)}
                      </p>
                    </div>
                    <button onClick={goNext} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      Continue <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step: Schedule */}
            {current === "schedule" && (
              <motion.div key="step1" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                {/* The catch-them-before-they-pay-more prompt. Shown to anyone
                    booking dry cleaning or household items who hasn't already
                    taken the combo — the exact two cases the client lost money
                    on were a single duvet and 9 loose garments. */}
                {!isCombo && (form.service === "dry-clean" || form.service === "household") && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, background: "#FFF5F6", border: "1.5px solid rgba(184,50,79,0.25)", borderLeft: "5px solid #ED1D24", borderRadius: 14, padding: "16px 18px", marginBottom: 24 }}>
                    <Sparkles size={18} color="#B30F14" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#161616", margin: 0 }}>
                        Cleaning 5 pieces or more? Pay ${DRY_CLEAN_COMBO.priceCad} flat.
                      </p>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", color: "#6B6B6B", margin: "4px 0 10px", lineHeight: 1.55 }}>
                        {DRY_CLEAN_COMBO.description} A king duvet alone is $39.99 — four garments with it costs about $10 more.
                      </p>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => { setComboOptIn(true); setForm(p => ({ ...p, service: "dry-clean" })); }}
                          style={{ background: "#ED1D24", color: "#FFFFFF", border: "none", borderRadius: 999, padding: "8px 18px", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          Add the {DRY_CLEAN_COMBO.tagline} combo
                        </button>
                        <a href="/offer" style={{ display: "inline-flex", alignItems: "center", fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", color: "#B30F14", textDecoration: "underline" }}>
                          What&apos;s included?
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  {form.service === "detailing"
                    ? <>When should we come to clean your <em className="display-accent" style={{ display: "inline" }}>sofa and car?</em></>
                    : <>When should we <em className="display-accent" style={{ display: "inline" }}>come?</em></>}
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>
                  {form.service === "detailing" ? "Choose a date and appointment window." : "Choose a pickup date and time window."}
                </p>

                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}><Calendar size={13} style={{ display: "inline", marginRight: 6 }} />{form.service === "detailing" ? "Appointment Date" : "Pickup Date"}</label>
                  {/* min was built from toISOString(), which is UTC — between
                      8pm and midnight Eastern that's already tomorrow, so the
                      picker blocked tonight's valid bookings. todayStr is the
                      Toronto date the rest of this flow already works from. */}
                  <input type="date" value={form.date} min={todayStr}
                    onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setErrors(p => ({ ...p, date: undefined })); }}
                    style={inputStyle}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = "#ED1D24"}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = "#E4E4E7"}
                  />
                  {errors.date && <p style={{ color: "#DC2626", fontSize: "0.8rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>{errors.date}</p>}
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}><Clock size={13} style={{ display: "inline", marginRight: 6 }} />{form.service === "detailing" ? "Appointment Window" : "Time Window"}</label>
                  {availableTimeSlots.length === 0 ? (
                    <p style={{ color: "#6B6B6B", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem" }}>
                      {form.service === "detailing" ? "No appointment windows left for today — please choose another date." : "No pickup windows left for today — please choose another date."}
                    </p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                      {availableTimeSlots.map(s => (
                        <button key={s.label} onClick={() => setForm(p => ({ ...p, time: s.label }))} style={{
                          padding: "10px 12px", border: `1.5px solid ${form.time === s.label ? "#ED1D24" : "#E4E4E7"}`,
                          borderRadius: 10, background: form.time === s.label ? "#F2F2F2" : "#ffffff",
                          color: form.time === s.label ? "#B30F14" : "#6B6B6B",
                          fontFamily: "Kodchasan, sans-serif", fontWeight: form.time === s.label ? 700 : 500, fontSize: "0.8125rem",
                          cursor: "pointer", transition: "all 0.15s",
                        }}>{s.label}</button>
                      ))}
                    </div>
                  )}
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

            {/* Step: Details */}
            {current === "details" && (
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
                        onFocus={e => { if (!errors[key]) (e.target as HTMLInputElement).style.borderColor = "#ED1D24"; }}
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
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "#ED1D24"}
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

            {/* Step: Confirm */}
            {current === "confirm" && (
              <motion.div key="step3" custom={direction} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.75rem", color: "#161616", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Ready to <em className="display-accent" style={{ display: "inline" }}>confirm?</em>
                </h2>
                <p style={{ color: "#6B6B6B", marginBottom: 28, fontFamily: "Kodchasan, sans-serif" }}>Review your order details below.</p>

                <div style={{ background: "#F2F2F2", borderRadius: 16, padding: "24px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  {([
                    { label: "Service", value: selectedService?.title },
                    isCombo ? { label: "Offer", value: `${DRY_CLEAN_COMBO.tagline} combo — $${DRY_CLEAN_COMBO.priceCad} flat for ${DRY_CLEAN_COMBO.pieceCount} pieces` } : null,
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

                {/* The bill, immediately above the order button — the client's
                    actual request: "the customer wants to see the bill ... and
                    then press the order button, after checking the total
                    price (at least estimated)". */}
                <div style={{ border: "2px solid #161616", borderRadius: 16, padding: "22px 24px", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, gap: 12 }}>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#161616", margin: 0 }}>
                      Your bill
                    </p>
                    {!estimate.isEmpty && stepIds.includes("estimate") && (
                      <button
                        type="button"
                        onClick={() => { setDirection(-1); setStep(stepIds.indexOf("estimate")); }}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#B30F14", textDecoration: "underline" }}
                      >
                        Edit items
                      </button>
                    )}
                  </div>

                  {estimate.isEmpty && stepIds.includes("estimate") ? (
                    <div>
                      <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem", color: "#6B6B6B", margin: "0 0 12px", lineHeight: 1.6 }}>
                        You haven&apos;t listed your items, so we can&apos;t estimate a total yet. We&apos;ll count and
                        price everything at pickup and confirm before any work starts — or you can add them now
                        and see the bill first.
                      </p>
                      <button
                        type="button"
                        onClick={() => { setDirection(-1); setStep(stepIds.indexOf("estimate")); }}
                        className="btn-ghost"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <ArrowLeft size={14} /> {isPerLbService(form.service) ? "Estimate my weight" : "Add my items"}
                      </button>
                    </div>
                  ) : (
                    <EstimateBill estimate={estimate} />
                  )}
                </div>

                <p style={{ color: "#8C8C8C", fontSize: "0.8125rem", marginBottom: 16, fontFamily: "Kodchasan, sans-serif" }}>
                  Prices shown {HST_LABEL}. ${MINIMUM_ORDER.standardCad} minimum order value before HST applies
                  (${MINIMUM_ORDER.detailingCad} for Car &amp; Sofa Detailing). Free pickup &amp; delivery included.
                  We confirm the final price with you before any work begins.
                </p>

                <StripeCardStep
                  name={form.name}
                  email={form.email}
                  onSaved={setSavedCard}
                  onConfigResolved={setPaymentsEnabled}
                />

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
                  <input
                    type="checkbox" checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: "#ED1D24", flexShrink: 0, cursor: "pointer" }}
                  />
                  <span style={{ color: "#4A4A4A", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif", lineHeight: 1.5 }}>
                    I've read and agree to Starex's <a href="/terms" target="_blank" style={{ color: "#B30F14", textDecoration: "underline" }}>Terms &amp; Conditions</a>,{" "}
                    <a href="/privacy" target="_blank" style={{ color: "#B30F14", textDecoration: "underline" }}>Privacy Policy</a>, and{" "}
                    <a href="/refund-policy" target="_blank" style={{ color: "#B30F14", textDecoration: "underline" }}>Refund, Cancellation &amp; Damage Policy</a>.
                  </span>
                </label>

                {submitError && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, color: "#EF4444", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>
                    {submitError}
                  </div>
                )}

                {(() => {
                  const needsCard = paymentsEnabled && !savedCard;
                  const blocked = submitting || !termsAccepted || needsCard;
                  return (
                <>
                {needsCard && (
                  <p style={{ color: "#B45309", fontSize: "0.8125rem", marginBottom: 12, fontFamily: "Kodchasan, sans-serif" }}>Save a card above to continue.</p>
                )}
                {/* Rating next to the button that commits the order (per
                    client). Renders nothing unless there is real data. */}
                <div style={{ marginBottom: 14 }}><TrustBadge /></div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={goBack} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><ArrowLeft size={14} /> Back</button>
                  <button onClick={handleSubmit} disabled={blocked} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: blocked ? 0.5 : 1, cursor: blocked ? "not-allowed" : "pointer" }}>
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
                </>
                  );
                })()}
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
                  {estimate.isEmpty ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#8C8C8C", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{isCombo ? "Combo price" : "Starting from"}</span>
                        <span style={{ color: "#ED1D24", fontSize: "1rem", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
                          {isCombo ? `$${DRY_CLEAN_COMBO.priceCad} flat` : (selectedService?.price || "—")}
                        </span>
                      </div>
                      <p style={{ color: "#8C8C8C", fontSize: "0.75rem", marginTop: 6, fontFamily: "Kodchasan, sans-serif" }}>
                        {form.service === "detailing"
                          ? `Quoted on inspection. Prices shown ${HST_LABEL}.`
                          : `Add your ${isPerLbService(form.service) ? "weight" : "items"} to see the full bill. Prices shown ${HST_LABEL}.`}
                      </p>
                    </>
                  ) : (
                    <EstimateBill estimate={estimate} compact />
                  )}
                </div>
              </div>
              <div style={{ marginTop: 20, background: "#F2F2F2", borderRadius: 10, padding: "11px 14px" }}>
                <p style={{ color: "#B30F14", fontSize: "0.8125rem", fontWeight: 700, fontFamily: "Kodchasan, sans-serif" }}>
                  {isCombo
                    ? `${DRY_CLEAN_COMBO.tagline} combo — minimum order already met`
                    : form.service === "detailing"
                      ? `$${MINIMUM_ORDER.detailingCad} minimum order value`
                      : `$${MINIMUM_ORDER.standardCad} minimum order value`}
                </p>
              </div>
            </div>

            {/* Itemized price list — lives in the sidebar (not gated to Step 0)
                so it's visible on every step, including when a "Book this
                service" CTA pre-selects the service and skips straight to
                Schedule. Customers can see exact prices and book without
                ever leaving this screen. */}
            {CATALOG_FOR_SERVICE[form.service] && current !== "estimate" && (
              <div style={{ marginTop: 16, background: "#ffffff", border: "1px solid rgba(20,20,20,0.08)", borderRadius: 20, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", maxHeight: 420, overflowY: "auto" }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9375rem", color: "#161616", marginBottom: 16 }}>Item Prices</p>
                {CATALOG_FOR_SERVICE[form.service].map(catId => {
                  const tab = CATALOG.find(t => t.id === catId);
                  if (!tab) return null;
                  return (
                    <div key={catId} style={{ marginBottom: 16 }}>
                      <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#B30F14", marginBottom: 8 }}>
                        {catId === form.service ? tab.label : `Also dry-cleanable: ${tab.label}`}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {tab.sections.flatMap(s => s.items).map(item => (
                          <div key={item.name} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", borderBottom: "1px solid #EFEFEF" }}>
                            <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#4A4A4A" }}>{item.name}</span>
                            <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#161616", whiteSpace: "nowrap" }}>
                              {item.from ? "From " : ""}${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.7rem", color: "#8C8C8C" }}>
                  Prices shown {HST_LABEL}. ${MINIMUM_ORDER.standardCad} minimum order value before HST applies. Free pickup & delivery included.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .book-sticky-total { display: none; }
        @media (max-width: 768px) {
          .book-layout { grid-template-columns: 1fr !important; }
          .book-sticky-total {
            display: flex; align-items: center; justify-content: space-between; gap: 16;
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
            background: #FFFFFF; border-top: 1px solid rgba(20,20,20,0.1);
            padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
            box-shadow: 0 -4px 16px rgba(0,0,0,0.07);
          }
          /* keep the bar from covering the last row of the catalog */
          .book-layout { padding-bottom: 92px; }
        }
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
