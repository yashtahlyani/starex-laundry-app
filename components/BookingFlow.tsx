"use client";

import { useState, useEffect } from "react";
import {
  motion, AnimatePresence, useReducedMotion,
} from "framer-motion";
import {
  Shirt, Wind, Sparkles, Zap, Car, Home, CheckCircle, ArrowRight,
  MapPin, Clock, User, Phone, Mail, ChevronRight, Package,
} from "lucide-react";
import { PLANS, estimateOrderAmountCents } from "@/lib/pricing";
import PaymentStep from "@/components/PaymentStep";

type Step = 1 | 2 | 3 | 4;

const ease = [0.16, 1, 0.3, 1] as const;

const SERVICE_ICONS: Record<string, React.ElementType> = {
  "wash-fold": Shirt,
  express: Zap,
  "dry-clean": Wind,
  ironing: Sparkles,
  household: Home,
  detailing: Car,
};
const SERVICE_BG: Record<string, string> = {
  "wash-fold": "bg-red-50 border-red-200",
  express: "bg-amber-50 border-amber-200",
  "dry-clean": "bg-purple-50 border-purple-200",
  ironing: "bg-orange-50 border-orange-200",
  household: "bg-blue-50 border-blue-200",
  detailing: "bg-stone-100 border-stone-200",
};
const SERVICE_ICON_COLOR: Record<string, string> = {
  "wash-fold": "text-red-600",
  express: "text-amber-600",
  "dry-clean": "text-purple-600",
  ironing: "text-orange-600",
  household: "text-blue-600",
  detailing: "text-stone-600",
};

const SLOTS = [
  { label: "Today 2–4 pm",      dayOffset: 0, startHour: 14, endHour: 16 },
  { label: "Today 4–6 pm",      dayOffset: 0, startHour: 16, endHour: 18 },
  { label: "Tomorrow 9–11 am",  dayOffset: 1, startHour: 9,  endHour: 11 },
  { label: "Tomorrow 11am–1pm", dayOffset: 1, startHour: 11, endHour: 13 },
  { label: "Tomorrow 2–4 pm",   dayOffset: 1, startHour: 14, endHour: 16 },
  { label: "Tomorrow 4–6 pm",   dayOffset: 1, startHour: 16, endHour: 18 },
];

function slotToRange(label: string) {
  const s = SLOTS.find((x) => x.label === label);
  if (!s) return null;
  const start = new Date();
  start.setDate(start.getDate() + s.dayOffset);
  start.setHours(s.startHour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(s.endHour, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Animated step bar ────────────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  const steps = ["Service", "Address", "Details", "Payment"];
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((label, i) => {
          const num = (i + 1) as Step;
          const done = step > num;
          const active = step === num;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold relative overflow-hidden`}
                  animate={{
                    backgroundColor: done ? "#00C9A7" : active ? "#1E5FA0" : "#F1F5F9",
                    color: done || active ? "#ffffff" : "#94A3B8",
                    scale: active ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3, ease }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {done ? (
                      <motion.div key="check" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}>
                        <CheckCircle size={14} />
                      </motion.div>
                    ) : (
                      <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        {num}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <motion.span
                  className="mt-1.5 text-xs font-medium hidden sm:block"
                  animate={{ color: active ? "#1E5FA0" : done ? "#6B7280" : "#CBD5E1" }}
                >
                  {label}
                </motion.span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mb-5 sm:mb-0 bg-gray-100 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-brand-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: done ? 1 : 0 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.45, ease }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function Confetti() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 340 - 170,
    rotate: Math.random() * 720 - 360,
    color: ["#1E5FA0", "#00C9A7", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA"][i % 6],
    delay: Math.random() * 0.5,
    size: Math.random() * 8 + 5,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-1/2 left-1/2 rounded-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, -120, 200], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  );
}

// ─── Animated checkmark SVG ───────────────────────────────────────────────────
function AnimatedCheck() {
  return (
    <svg viewBox="0 0 52 52" className="w-full h-full" fill="none">
      <motion.circle
        cx="26" cy="26" r="24"
        stroke="#22C55E" strokeWidth="2.5" fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease }}
      />
      <motion.path
        d="M14 27l8 8 16-16"
        stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease }}
      />
    </svg>
  );
}

// ─── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ orderId }: { orderId: string }) {
  return (
    <motion.div
      className="text-center py-8 relative"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease }}
    >
      <Confetti />

      <div className="relative inline-flex mb-6">
        <motion.div
          className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
        >
          <div className="h-14 w-14">
            <AnimatedCheck />
          </div>
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-brand flex items-center justify-center"
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 14, delay: 0.9 }}
        >
          <Sparkles size={14} className="text-white" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease }}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
          A confirmation has been sent to your email and WhatsApp with your pickup window and all the details.
        </p>
      </motion.div>

      <motion.div
        className="inline-block bg-brand-50 border border-brand-200 rounded-2xl px-8 py-5 mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.75, type: "spring", stiffness: 280, damping: 18 }}
      >
        <p className="text-xs text-brand font-semibold uppercase tracking-wider mb-1">Your Order ID</p>
        <p className="text-3xl font-bold font-mono text-brand-900 tracking-wide">{orderId}</p>
        <p className="text-xs text-gray-400 mt-1">Save this to track your order</p>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.45, ease }}
      >
        <motion.a
          href={`/order?code=${orderId}`}
          className="btn-primary"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          <Package size={16} /> Track My Order
        </motion.a>
        <motion.a
          href="/"
          className="btn-secondary"
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
        >
          Back to Home
        </motion.a>
      </motion.div>
    </motion.div>
  );
}

// ─── Main booking flow ────────────────────────────────────────────────────────
export default function BookingFlow() {
  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState<string>(PLANS[0].id);
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderCode, setPendingOrderCode] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const reduced = useReducedMotion();
  const selectedPlan = PLANS.find((p) => p.id === serviceId)!;
  const preAuthAmountCad = (estimateOrderAmountCents(serviceId) / 100).toFixed(2);

  function goTo(next: Step) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    const range = slotToRange(slot);
    if (!range) { setError("Please pick a pickup window."); setSubmitting(false); return; }
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, name, email, phone, address, postalCode, pickupSlotStart: range.start, pickupSlotEnd: range.end }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      if (data.clientSecret) {
        // Payments are configured — collect the card before showing success.
        setPendingOrderCode(data.orderCode);
        setClientSecret(data.clientSecret);
        goTo(4);
      } else {
        // Stripe isn't wired in yet — booking still stands, skip straight to confirmation.
        setOrderId(data.orderCode);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) return <SuccessScreen orderId={orderId} />;

  const slideVariants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -60, opacity: 0 }),
  };

  const transitionConfig = { duration: 0.38, ease };

  return (
    <div>
      <StepBar step={step} />

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        {/* ── Step 1: Service ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionConfig}
            className="space-y-3"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-5">Choose a service</h2>
            {PLANS.map((s) => {
              const Icon = SERVICE_ICONS[s.id] ?? Shirt;
              const selected = serviceId === s.id;
              return (
                <motion.button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-colors duration-200 ${
                    selected ? "border-brand bg-brand-50" : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  animate={selected ? { boxShadow: "0 0 0 3px rgba(203,62,94,0.15)" } : { boxShadow: "0 0 0 0px rgba(0,0,0,0)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <motion.div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-brand" : SERVICE_BG[s.id]}`}
                    animate={{ backgroundColor: selected ? "#CB3E5E" : undefined }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={22} className={selected ? "text-white" : SERVICE_ICON_COLOR[s.id]} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${selected ? "text-brand" : "text-gray-900"}`}>{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.turnaround} turnaround</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${selected ? "text-brand" : "text-gray-500"}`}>
                      {s.price !== null ? `$${s.price.toFixed(2)}` : "Custom"}
                    </p>
                    <p className="text-xs text-gray-400">{s.unit}</p>
                  </div>
                  <AnimatePresence>
                    {selected && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 14 }}>
                        <CheckCircle size={18} className="text-brand shrink-0" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <motion.button
              className="btn-primary w-full mt-6"
              onClick={() => goTo(2)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 16 }}
            >
              Continue <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 2: Address & Slot ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionConfig}
            className="space-y-5"
          >
            <h2 className="text-xl font-bold text-gray-900">Pickup address & time</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
              <div className="relative group">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                <input
                  className="input-field pl-10"
                  placeholder="e.g. 123 Main Street, Apt 4B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
              <input
                className="input-field"
                placeholder="e.g. V6B 1A1"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                maxLength={7}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock size={14} className="inline mr-1.5 text-gray-400" />
                Pick a Pickup Window
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {SLOTS.map((s) => (
                  <motion.button
                    key={s.label}
                    onClick={() => setSlot(s.label)}
                    className={`rounded-xl border-2 p-3 text-sm font-medium text-left transition-colors ${
                      slot === s.label ? "border-brand bg-brand-50 text-brand" : "border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={slot === s.label ? { boxShadow: "0 0 0 3px rgba(30,95,160,0.12)" } : { boxShadow: "none" }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <p className="font-bold text-xs text-gray-400 mb-0.5">
                      {s.dayOffset === 0 ? "TODAY" : "TOMORROW"}
                    </p>
                    {s.label.replace(/^Today |^Tomorrow /, "")}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button className="btn-secondary flex-1" onClick={() => goTo(1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Back
              </motion.button>
              <motion.button
                className="btn-primary flex-1 disabled:opacity-40"
                disabled={!address || !postalCode || !slot}
                onClick={() => goTo(3)}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 16 }}
              >
                Continue <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Contact ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionConfig}
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your details</h2>
              <p className="text-sm text-gray-500 mt-1">We'll send your confirmation and updates here.</p>
            </div>

            {[
              { label: "Full Name", icon: User, value: name, setter: setName, placeholder: "Your full name", type: "text" },
              { label: "Phone Number", icon: Phone, value: phone, setter: setPhone, placeholder: "+1 (555) 123-4567", type: "tel", hint: "(for WhatsApp updates)" },
              { label: "Email Address", icon: Mail, value: email, setter: setEmail, placeholder: "you@example.com", type: "email" },
            ].map(({ label, icon: Icon, value, setter, placeholder, type, hint }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {label}
                  {hint && <span className="ml-1 text-xs text-gray-400 font-normal">{hint}</span>}
                </label>
                <div className="relative group">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" />
                  <motion.input
                    className="input-field pl-10"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    type={type}
                    whileFocus={{ boxShadow: "0 0 0 3px rgba(30,95,160,0.12)" }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
              </div>
            ))}

            {/* Order summary */}
            <motion.div
              className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease }}
            >
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Summary</p>
              {[
                { k: "Service", v: selectedPlan.label },
                { k: "Pickup",  v: slot },
                { k: "Address", v: address },
              ].map(({ k, v }) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium truncate ml-4 text-right max-w-[180px]">{v}</span>
                </div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              <motion.button className="btn-secondary flex-1" onClick={() => goTo(2)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Back
              </motion.button>
              <motion.button
                className="btn-primary flex-1 disabled:opacity-40"
                disabled={!name || !phone || !email || submitting}
                onClick={handleConfirm}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 350, damping: 16 }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.span
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    Confirming…
                  </span>
                ) : (
                  <>Confirm Booking <ArrowRight size={16} /></>
                )}
              </motion.button>
            </div>

            <p className="text-center text-xs text-gray-400">
              By booking you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        )}

        {/* ── Step 4: Payment ── */}
        {step === 4 && clientSecret && pendingOrderCode && (
          <motion.div
            key="step4"
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionConfig}
          >
            <PaymentStep
              clientSecret={clientSecret}
              amountCad={preAuthAmountCad}
              onBack={() => goTo(3)}
              onSuccess={() => setOrderId(pendingOrderCode)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
