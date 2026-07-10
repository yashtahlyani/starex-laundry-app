"use client";

import { useState, useMemo } from "react";
import {
  Shirt, Wind, Sparkles, Scissors, Home, Search,
  CheckCircle, ArrowRight, Clock,
} from "lucide-react";
import { CATALOG, PLANS, PICKUP_DELIVERY, MEMBERSHIP } from "@/lib/pricing";

const TAB_ICONS: Record<string, React.ElementType> = {
  "wash-fold": Shirt,
  household:   Home,
  "dry-clean": Wind,
  ironing:     Sparkles,
  alteration:  Scissors,
};

const TAB_COLORS: Record<string, { bg: string; text: string }> = {
  "wash-fold": { bg: "bg-[#D1F9E3]", text: "text-[#0a3547]" },
  household:   { bg: "bg-[#E4F4FB]", text: "text-[#0a3547]" },
  "dry-clean": { bg: "bg-[#EAEDf9]", text: "text-[#4c4abf]" },
  ironing:     { bg: "bg-[#FDF1E1]", text: "text-[#c2730a]" },
  alteration:  { bg: "bg-[#D1F9E3]", text: "text-[#0a3547]" },
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState(CATALOG[0].id);
  const [query, setQuery] = useState("");

  const activeService = CATALOG.find((t) => t.id === activeTab)!;
  const colors = TAB_COLORS[activeTab] ?? TAB_COLORS["wash-fold"];
  const Icon = TAB_ICONS[activeTab] ?? Shirt;

  const filteredSections = useMemo(() => {
    if (!query.trim()) return activeService.sections;
    const q = query.toLowerCase();
    return activeService.sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.name.toLowerCase().includes(q)),
      }))
      .filter((s) => s.items.length > 0);
  }, [activeService, query]);

  return (
    <div className="min-h-screen bg-[#111921] pt-16">
      {/* Page hero */}
      <div className="bg-[#0a3547] border-b border-white/8 py-14 px-4 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-mint/8 blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-6xl relative">
          <div className="flex items-center gap-2 text-white/35 text-sm mb-4 font-body">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-white/70">Services &amp; Pricing</span>
          </div>
          <span className="eyebrow">Pricing</span>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-white mb-3">Services &amp; Pricing</h1>
          <p className="text-white/50 text-lg max-w-xl font-body">
            Transparent pricing on every item. No surprises at checkout.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        <span className="eyebrow">Plans</span>
        <h2 className="text-2xl font-bold text-white font-heading mb-8">Choose how you pay</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Pay as you go */}
          <div className="card rounded-2xl p-7">
            <p className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-3 font-body">Pay As You Go</p>
            <p className="text-4xl font-bold text-[#09090B] font-heading mb-1">
              $1.25<span className="text-base font-normal text-[#71717A]">/lb</span>
            </p>
            <p className="text-sm text-[#52525B] mb-5 font-body">Wash &amp; fold, no subscription needed.</p>
            <ul className="space-y-2.5 mb-6">
              {[
                `Free pickup & delivery over ${PICKUP_DELIVERY.freeOverLb} lbs`,
                `$${PICKUP_DELIVERY.feeUnderLb} fee under ${PICKUP_DELIVERY.freeOverLb} lbs`,
                `${PICKUP_DELIVERY.minimumLb} lb minimum order`,
                "Real-time email & WhatsApp updates",
                "12–48 hr turnaround",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#52525B] font-body">
                  <CheckCircle size={14} className="text-mint shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <a href="/book" className="btn-ghost w-full text-center text-[#111921] border-[#111921]/20 hover:border-mint hover:text-mint">Book Now</a>
          </div>

          {/* Membership */}
          <div className="card rounded-2xl border-2 border-mint p-7 relative overflow-hidden">
            <div className="absolute top-5 right-5 step-pill text-xs">Best Value</div>
            <p className="text-xs font-bold uppercase tracking-wider text-mint mb-3 font-body">Starex Club</p>
            <p className="text-4xl font-bold text-[#09090B] font-heading mb-1">
              $8.99<span className="text-base font-normal text-[#71717A]">/mo</span>
            </p>
            <p className="text-sm text-[#52525B] mb-5 font-body">All Pay As You Go perks, plus:</p>
            <ul className="space-y-2.5 mb-6">
              {MEMBERSHIP.perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-[#52525B] font-body">
                  <CheckCircle size={14} className="text-mint shrink-0" /> {p}
                </li>
              ))}
            </ul>
            <a href="/book" className="btn-primary w-full text-center">Join Starex Club</a>
          </div>
        </div>

        {/* Full catalog */}
        <div>
          <span className="eyebrow">Full Price List</span>
          <h2 className="text-2xl font-bold text-white font-heading mb-6">Every item, every price</h2>

          {/* Tabs */}
          <div className="border-b border-white/8 mb-6 overflow-x-auto">
            <div className="flex gap-0 min-w-max">
              {CATALOG.map((tab) => {
                const TabIcon = TAB_ICONS[tab.id] ?? Shirt;
                const active = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setQuery(""); }}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap font-body ${
                      active
                        ? "border-mint text-mint"
                        : "border-transparent text-white/45 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label.replace(" Preferences", "")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <Icon size={18} className={colors.text} />
                </div>
                <div>
                  <p className="font-bold text-white font-heading">{activeService.label}</p>
                  <p className="text-xs text-white/40 font-body">{activeService.blurb}</p>
                </div>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  className="input-field pl-8 py-2 text-sm w-full sm:w-56"
                  placeholder="Search items…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-16 text-white/30">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium font-body">No items match &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {filteredSections.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3 px-1 font-body">
                  {section.title}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {section.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-white/8 bg-[#1a2332] px-4 py-3 hover:border-mint/30 hover:bg-white/5 transition-all group"
                    >
                      <span className="text-sm text-white/55 group-hover:text-white/80 transition-colors font-body">
                        {item.name}
                      </span>
                      <span className="text-sm font-bold text-mint ml-4 shrink-0 font-heading">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Turnaround info */}
        <div className="mt-10 rounded-2xl bg-[#0a3547] border border-mint/15 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-mint/15 flex items-center justify-center shrink-0">
              <Clock size={22} className="text-mint" />
            </div>
            <div>
              <p className="font-bold text-lg text-white font-heading">Ready to book?</p>
              <p className="text-white/45 text-sm font-body">
                Wash &amp; fold in 12–48 hrs · Dry cleaning 2–3 days · Ironing 24 hrs
              </p>
            </div>
          </div>
          <a href="/book" className="btn-primary shrink-0">
            Book a Pickup <ArrowRight size={15} />
          </a>
        </div>

        <p className="text-xs text-white/25 mt-6 text-center font-body">
          * Prices shown exclude applicable taxes. Final price confirmed after weighing / item count.
        </p>
      </div>
    </div>
  );
}
