"use client";

import { motion, useReducedMotion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Truck, Clock, Star, Shield, Sparkles, ArrowRight,
  CheckCircle, Shirt, Wind, Scissors, ChevronDown, Package,
  Zap, RefreshCw, HeartHandshake, Leaf, MapPin,
} from "lucide-react";
import { BUSINESS_NAME, PLANS, PICKUP_DELIVERY, MEMBERSHIP } from "@/lib/pricing";
import TestimonialsCarousel from "@/components/ui/TestimonialsCarousel";
import MobileBookingCTA from "@/components/ui/MobileBookingCTA";
import { FadeIn, FadeInStagger, FadeInItem } from "@/components/ui/FadeIn";

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 40, damping: 18 });
  const rounded = useTransform(spring, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );
  useEffect(() => { if (inView) mv.set(to); }, [inView, to, mv]);
  return <span ref={ref}><motion.span>{rounded}</motion.span>{suffix}</span>;
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const reduced = useReducedMotion();
  const fadeUp = (delay: number) => ({
    initial: reduced ? {} : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 as const },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#111921]">
      {/* Background glow orbs */}
      <motion.div
        className="absolute -top-32 -right-32 h-[560px] w-[560px] rounded-full bg-mint/8 blur-[120px] pointer-events-none"
        animate={reduced ? {} : { scale: [1, 1.12, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-[#0a3547]/60 blur-[100px] pointer-events-none"
        animate={reduced ? {} : { scale: [1, 1.2, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute bottom-20 right-1/3 h-56 w-56 rounded-full bg-mint/5 blur-[80px] pointer-events-none"
        animate={reduced ? {} : { scale: [1, 1.3, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-28 pb-20 w-full">
        <div className="max-w-3xl space-y-0">

          {/* Badge */}
          <motion.div {...fadeUp(0.1)} className="mb-8">
            <span className="hero-badge">
              <Sparkles size={13} className="text-mint" />
              Trusted by 10,000+ Canadians
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.2)}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading text-white leading-[1.07] tracking-tight mb-6"
          >
            Fresh laundry,{" "}
            <span className="display-accent">delivered</span>
            <br className="hidden sm:block" /> to your door.
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.3)} className="text-xl text-white/55 max-w-2xl leading-relaxed mb-10 font-body">
            Book online in 60 seconds. {BUSINESS_NAME} picks up your laundry, washes and
            dry-cleans it, and delivers it back — fresh, folded, and on time.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.4)} className="flex flex-wrap gap-4 mb-12">
            <motion.a
              href="/book"
              className="btn-primary text-base px-7 py-3.5"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
            >
              Book a Pickup <ArrowRight size={16} />
            </motion.a>
            <motion.a
              href="/services"
              className="btn-ghost text-base px-7 py-3.5"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
            >
              See Pricing
            </motion.a>
          </motion.div>

          {/* Trust row */}
          <motion.div {...fadeUp(0.5)} className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { icon: Truck,  text: `Free pickup & delivery ${PICKUP_DELIVERY.freeOverLb}+ lbs` },
              { icon: Clock,  text: "24-hr turnaround" },
              { icon: Star,   text: "4.8★ rated · 10k+ orders" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-white/45 font-body">
                <Icon size={14} className="text-mint" /> {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating cards — desktop */}
        <div className="hidden lg:flex flex-col gap-4 absolute right-8 top-1/2 -translate-y-1/2 w-72">
          <motion.div
            className="card-dark rounded-2xl p-5 border border-white/8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease }}
          >
            <motion.div
              animate={reduced ? {} : { y: [0, -7, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-mint/15 flex items-center justify-center">
                  <CheckCircle size={18} className="text-mint" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold font-heading">Booking Confirmed!</p>
                  <p className="text-white/40 text-xs font-body">Order STX-482913</p>
                </div>
              </div>
              <p className="text-white/40 text-xs font-body">Pickup today 2–4 pm · 123 Main St</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="card-dark rounded-2xl p-5 border border-white/8"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease }}
          >
            <motion.div
              animate={reduced ? {} : { y: [0, 7, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-[#0a3547]/80 flex items-center justify-center">
                  <Truck size={18} className="text-mint" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold font-heading">Out for Delivery!</p>
                  <p className="text-white/40 text-xs font-body">Arriving in ~30 min</p>
                </div>
              </div>
              <div className="w-full bg-white/8 rounded-full h-1.5 mt-2 overflow-hidden">
                <motion.div
                  className="bg-mint h-1.5 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1.2, duration: 1.2, ease }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 text-xs font-body"
        animate={reduced ? {} : { y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span>Scroll</span>
        <ChevronDown size={13} />
      </motion.div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 10000, suffix: "+",  label: "Happy customers" },
    { value: 4.8,   decimals: 1, suffix: "★", label: "Average rating" },
    { value: 24,    suffix: " hrs", label: "Avg turnaround" },
    { value: 100,   suffix: "%",  label: "Satisfaction guarantee" },
  ];
  return (
    <section className="border-y border-white/6 bg-[#0e1720] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeInStagger stagger={0.08} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <FadeInItem key={s.label}>
              <div className="text-center">
                <p className="text-3xl font-bold text-mint font-heading">
                  <Counter to={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="text-sm text-white/40 mt-1 font-body">{s.label}</p>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const reduced = useReducedMotion();
  const steps = [
    { step: "01", icon: Package,  title: "Book online in 60 seconds",   desc: "Choose your service, enter your address, pick a pickup window — no account required." },
    { step: "02", icon: Truck,    title: "We pick up & clean",           desc: "Our driver arrives in your window. We wash, dry, fold, or dry-clean with expert care." },
    { step: "03", icon: Sparkles, title: "Fresh delivery to your door",  desc: "Your order comes back clean and packaged. Real-time updates at every step." },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#111921] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">How It Works</span>
          <h2 className="section-title">Laundry day, reimagined</h2>
          <p className="section-subtitle">From booking to delivery — we handle everything so you don&apos;t have to.</p>
        </FadeIn>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px overflow-hidden">
            <div className="w-full h-full bg-white/8" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-mint/40 to-mint"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              style={{ originX: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease }}
            />
          </div>

          <FadeInStagger stagger={0.14} className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((s) => (
              <FadeInItem key={s.step}>
                <motion.div
                  className="card relative flex flex-col items-center text-center p-8"
                  whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(120,237,178,0.12)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <div className="absolute -top-3.5 left-6">
                    <span className="step-pill">STEP {s.step}</span>
                  </div>
                  <motion.div
                    className="h-14 w-14 rounded-2xl bg-mint/10 flex items-center justify-center mb-5 text-mint"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <s.icon size={26} />
                  </motion.div>
                  <h3 className="text-lg font-bold font-heading text-[#09090B] mb-3">{s.title}</h3>
                  <p className="text-[#52525B] text-sm leading-relaxed font-body">{s.desc}</p>
                </motion.div>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>

        <FadeIn delay={0.3} className="text-center mt-12">
          <motion.a href="/book" className="btn-primary text-base px-8 py-3.5 inline-flex"
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 16 }}>
            Book Your First Pickup <ArrowRight size={16} />
          </motion.a>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Services Preview ─────────────────────────────────────────────────────────
function ServicesPreview() {
  const services = [
    { icon: Shirt,    id: "wash-fold",  title: "Wash & Fold",   price: `$${PLANS[0].price}/lb`,  desc: "Washed, dried, and neatly folded. 12–48 hour turnaround.",                    features: ["All fabric types", "Scent-free option", "Eco-friendly detergent"],  bg: "bg-[#D1F9E3]", iconColor: "text-[#0a3547]" },
    { icon: Wind,     id: "dry-clean",  title: "Dry Cleaning",  price: "From $5.99/item",          desc: "Professional dry cleaning for suits, dresses, and delicates.",              features: ["Suits & blazers", "Dresses & gowns", "Specialty fabrics"],           bg: "bg-[#EAEDf9]", iconColor: "text-[#4c4abf]" },
    { icon: Sparkles, id: "ironing",    title: "Ironing",       price: "From $2.99/item",          desc: "Crisp, wrinkle-free finish for shirts, pants, and linens.",                 features: ["Shirts & blouses", "Pants & suits", "Linens & tablecloths"],         bg: "bg-[#FDF1E1]", iconColor: "text-[#c2730a]" },
    { icon: Scissors, id: "alteration", title: "Alterations",   price: "From $2.99/item",          desc: "Expert tailoring — hems, zippers, buttons, and more.",                     features: ["Hems & take-ins", "Zippers & buttons", "Wedding dresses"],           bg: "bg-[#E4F4FB]", iconColor: "text-[#0a3547]" },
  ];

  return (
    <section className="py-24 bg-[#0e1720]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">Our Services</span>
          <h2 className="section-title">Everything your wardrobe needs</h2>
          <p className="section-subtitle">From everyday laundry to delicate dry cleaning — we&apos;ve got it covered.</p>
        </FadeIn>

        <FadeInStagger stagger={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <FadeInItem key={s.id}>
              <motion.a
                href={`/services#${s.id}`}
                className="card flex flex-col group"
                whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(120,237,178,0.10)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                  <s.icon size={22} className={s.iconColor} />
                </div>
                <h3 className="font-bold font-heading text-[#09090B] mb-1">{s.title}</h3>
                <p className="text-sm font-semibold text-mint mb-2 font-body">{s.price}</p>
                <p className="text-sm text-[#52525B] leading-relaxed mb-4 font-body">{s.desc}</p>
                <ul className="space-y-1.5 mt-auto">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#52525B] font-body">
                      <CheckCircle size={12} className="text-mint shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-mint group-hover:gap-2.5 transition-all duration-200 font-body">
                  Learn more <ArrowRight size={12} />
                </div>
              </motion.a>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}

// ─── Cities / Eco ─────────────────────────────────────────────────────────────
function TrustSection() {
  const cities = ["Vancouver, BC", "Toronto, ON", "Calgary, AB", "Edmonton, AB", "More cities soon ✦"];
  const ecoPerks = [
    { icon: Leaf,      text: "Biodegradable detergents" },
    { icon: RefreshCw, text: "Reusable laundry bags" },
    { icon: Zap,       text: "Energy-efficient machines" },
  ];

  return (
    <section className="py-20 bg-[#111921] border-y border-white/6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <FadeIn x={-24} y={0}>
            <span className="eyebrow"><MapPin size={12} className="inline mr-1" />Service Areas</span>
            <h2 className="text-2xl font-bold font-heading text-white mb-6">Serving Canadians coast to coast</h2>
            <div className="flex flex-wrap gap-3">
              {cities.map((c, i) => (
                <motion.div key={c}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease }}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-default font-body ${
                    i < cities.length - 1
                      ? "bg-mint/10 border-mint/25 text-mint"
                      : "bg-white/5 border-white/10 text-white/30"
                  }`}
                >
                  {c}
                </motion.div>
              ))}
            </div>
          </FadeIn>

          <FadeIn x={24} y={0} delay={0.1}>
            <div className="rounded-2xl bg-[#0a1e14] border border-mint/15 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-mint/15 flex items-center justify-center">
                  <Leaf size={18} className="text-mint" />
                </div>
                <div>
                  <p className="font-bold font-heading text-white">Eco-Friendly Promise</p>
                  <p className="text-xs text-white/40 font-body">Cleaning that cares about the planet</p>
                </div>
              </div>
              <div className="space-y-3">
                {ecoPerks.map((p, i) => (
                  <motion.div key={p.text}
                    className="flex items-center gap-3 text-sm text-white/60 font-body"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, ease }}
                  >
                    <p.icon size={15} className="text-mint shrink-0" /> {p.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Why Starex ───────────────────────────────────────────────────────────────
function WhyStarex() {
  const perks = [
    { icon: Truck,         title: "Free Pickup & Delivery", desc: `Free on orders over ${PICKUP_DELIVERY.freeOverLb} lbs. Just $${PICKUP_DELIVERY.feeUnderLb} below that.` },
    { icon: Zap,           title: "Lightning Fast",          desc: "Wash & fold ready in 12–48 hours. Same-day available in select areas." },
    { icon: Shield,        title: "100% Satisfaction",       desc: "Not happy? We re-clean it for free. No questions asked." },
    { icon: RefreshCw,     title: "Real-Time Tracking",      desc: "Email & WhatsApp updates at every stage — pickup, cleaning, delivery." },
    { icon: HeartHandshake,title: "Eco-Friendly",            desc: "We use biodegradable detergents and energy-efficient machines." },
    { icon: Star,          title: "Expert Care",             desc: "Trained professionals handle each item with the attention it deserves." },
  ];

  return (
    <section className="py-24 bg-[#0a3547] overflow-hidden relative">
      <motion.div
        className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-mint/8 blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">Why {BUSINESS_NAME}</span>
          <h2 className="section-title">Built around your convenience</h2>
          <p className="section-subtitle">We obsess over every detail so you can focus on what matters.</p>
        </FadeIn>

        <FadeInStagger stagger={0.08} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {perks.map((p) => (
            <FadeInItem key={p.title}>
              <motion.div
                className="rounded-2xl bg-white/5 border border-white/8 p-6 group cursor-default"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)", y: -4 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <div className="h-11 w-11 rounded-xl bg-mint/15 flex items-center justify-center mb-4">
                  <p.icon size={20} className="text-mint" />
                </div>
                <h3 className="font-bold font-heading text-white mb-2">{p.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed font-body">{p.desc}</p>
              </motion.div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#111921]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-16">
          <span className="eyebrow">Pricing</span>
          <h2 className="section-title">Simple, transparent pricing</h2>
          <p className="section-subtitle">No hidden fees. No surprises. Just clean clothes.</p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <FadeIn x={-20} y={0} delay={0.1}>
            <motion.div className="card border-2 border-transparent h-full"
              whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-4 font-body">Pay As You Go</p>
              <p className="text-5xl font-bold font-heading text-[#09090B]">
                $1.25<span className="text-xl font-normal text-[#71717A]">/lb</span>
              </p>
              <p className="text-sm text-[#52525B] mt-2 mb-6 font-body">Wash & fold. No commitment required.</p>
              <ul className="space-y-3 mb-8">
                {[
                  `Free pickup & delivery over ${PICKUP_DELIVERY.freeOverLb} lbs`,
                  `$${PICKUP_DELIVERY.feeUnderLb} fee under ${PICKUP_DELIVERY.freeOverLb} lbs`,
                  `${PICKUP_DELIVERY.minimumLb} lb minimum order`,
                  "Email & WhatsApp updates",
                  "24–48 hr turnaround",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-[#52525B] font-body">
                    <CheckCircle size={16} className="text-mint shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/book" className="btn-ghost w-full text-center text-[#111921] border-[#111921]/20 hover:border-mint hover:text-mint">
                Book Now
              </a>
            </motion.div>
          </FadeIn>

          <FadeIn x={20} y={0} delay={0.2}>
            <motion.div className="card border-2 border-mint relative overflow-hidden h-full"
              whileHover={{ y: -6, boxShadow: "0 20px 60px -10px rgba(120,237,178,0.20)" }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}>
              <motion.div
                className="absolute top-4 right-4 step-pill"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Most Popular
              </motion.div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#4ECDA0] mb-4 font-body">Starex Club</p>
              <p className="text-5xl font-bold font-heading text-[#09090B]">
                $8.99<span className="text-xl font-normal text-[#71717A]">/mo</span>
              </p>
              <p className="text-sm text-[#52525B] mt-2 mb-6 font-body">Everything above, plus:</p>
              <ul className="space-y-3 mb-8">
                {MEMBERSHIP.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm text-[#52525B] font-body">
                    <CheckCircle size={16} className="text-mint shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <a href="/book" className="btn-primary w-full text-center">Join Starex Club</a>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials() {
  return (
    <section className="py-24 bg-[#0e1720]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FadeIn className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">Reviews</span>
          <h2 className="section-title">Loved by customers across Canada</h2>
          <p className="section-subtitle text-sm mt-3 md:hidden text-white/35">Swipe to read more →</p>
        </FadeIn>
        <TestimonialsCarousel />
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const faqs = [
  { q: "How does pickup & delivery work?",           a: "Choose a pickup window when booking. Our driver arrives, collects your laundry in bags, and delivers it back to your door once cleaned." },
  { q: "What if I'm not home during pickup?",        a: "Leave your laundry bag in a safe spot (lobby, door, concierge) and note it when booking. We'll handle the rest." },
  { q: "How do you handle delicate or special items?",a: "All items are inspected before cleaning. Delicates are tagged individually and processed with appropriate care." },
  { q: "What areas do you serve?",                   a: "We currently serve Vancouver, Toronto, Calgary, and Edmonton. More cities coming soon." },
  { q: "What happens if something is damaged?",      a: "We carry insurance for all items in our care. If anything is damaged, we'll contact you immediately and make it right." },
  { q: "Do I need to create an account?",            a: "No account needed to book. Just enter your name, email, and phone. We'll track your order via your order ID." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-[#111921]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn className="text-center mb-16">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title">Common questions</h2>
        </FadeIn>
        <FadeInStagger stagger={0.07} className="space-y-3">
          {faqs.map((f, i) => (
            <FadeInItem key={f.q}>
              <div className="rounded-2xl border border-white/8 bg-[#1a2332] overflow-hidden">
                <motion.button
                  className="flex items-center justify-between w-full p-5 pr-6 font-semibold font-heading text-white text-left hover:text-mint transition-colors focus:outline-none"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  {f.q}
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25, ease }} className="shrink-0 ml-4">
                    <ChevronDown size={18} className="text-white/35" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed border-t border-white/6 font-body">
                        <p className="pt-4">{f.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-24 bg-[#0e1720]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <FadeIn>
          <div className="rounded-3xl bg-[#0a3547] border border-mint/15 p-12 sm:p-16 relative overflow-hidden">
            <motion.div
              className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-mint/8 blur-[80px] pointer-events-none"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <span className="eyebrow">Get Started Today</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white tracking-tight mb-4">
                Your first pickup is waiting
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-lg mx-auto font-body">
                Join thousands of Canadians who&apos;ve ditched laundry day for good.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a href="/book" className="btn-primary text-base px-8 py-3.5"
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 350, damping: 16 }}>
                  Book a Pickup <ArrowRight size={16} />
                </motion.a>
                <motion.a href="/services" className="btn-ghost text-base px-7 py-3.5"
                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 350, damping: 16 }}>
                  View All Services
                </motion.a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <ServicesPreview />
      <TrustSection />
      <WhyStarex />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <MobileBookingCTA />
    </>
  );
}
