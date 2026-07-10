import { Sparkles, Mail, Phone, MapPin, Share2, Globe, MessageCircle } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/pricing";

const services = [
  { label: "Wash & Fold",     href: "/services#wash-fold" },
  { label: "Dry Cleaning",    href: "/services#dry-clean" },
  { label: "Ironing",         href: "/services#ironing" },
  { label: "Alteration",      href: "/services#alteration" },
  { label: "Household Items", href: "/services#household" },
];

const company = [
  { label: "About Us",     href: "#" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing",      href: "/services#pricing" },
  { label: "Service Areas",href: "#" },
  { label: "Commercial",   href: "#" },
];

const support = [
  { label: "Track Your Order", href: "/order" },
  { label: "Book a Pickup",    href: "/book" },
  { label: "FAQ",              href: "/#faq" },
  { label: "Contact Us",       href: "mailto:hello@starexlaundry.ca" },
  { label: "Privacy Policy",   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1118] text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold font-heading text-white">Ready for fresh laundry?</h3>
            <p className="text-white/45 mt-1 text-sm font-body">Book in under 2 minutes. Pick up today.</p>
          </div>
          <a href="/book" className="btn-primary shrink-0">
            Book a Pickup →
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint text-[#0a1a0f]">
                <Sparkles size={16} />
              </div>
              <span className="text-lg font-bold font-heading">{BUSINESS_NAME}</span>
            </a>
            <p className="text-white/45 text-sm leading-relaxed mb-5 font-body">
              Professional laundry and dry cleaning with free pickup & delivery across Canada.
            </p>
            <div className="flex gap-3">
              {[Share2, Globe, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 hover:bg-mint hover:text-[#0a1a0f] transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4 font-body">Services</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-sm text-white/45 hover:text-mint transition-colors font-body">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4 font-body">Company</h4>
            <ul className="space-y-2.5">
              {company.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="text-sm text-white/45 hover:text-mint transition-colors font-body">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4 font-body">Contact</h4>
            <ul className="space-y-3 mb-5">
              <li>
                <a href="mailto:hello@starexlaundry.ca" className="flex items-center gap-2.5 text-sm text-white/45 hover:text-mint transition-colors font-body">
                  <Mail size={14} /> hello@starexlaundry.ca
                </a>
              </li>
              <li>
                <a href="tel:+1-555-123-4567" className="flex items-center gap-2.5 text-sm text-white/45 hover:text-mint transition-colors font-body">
                  <Phone size={14} /> +1 (555) 123-4567
                </a>
              </li>
              <li>
                <span className="flex items-start gap-2.5 text-sm text-white/45 font-body">
                  <MapPin size={14} className="mt-0.5 shrink-0" /> Vancouver · Toronto · Calgary · Edmonton
                </span>
              </li>
            </ul>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 font-body">Support</h4>
            {support.map((s) => (
              <a key={s.label} href={s.href} className="block text-sm text-white/45 hover:text-mint transition-colors mb-2 font-body">
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25 font-body">
          <p>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
          <p>Built with care for Canadians 🍁</p>
        </div>
      </div>
    </footer>
  );
}
