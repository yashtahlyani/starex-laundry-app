import BookingFlow from "@/components/BookingFlow";
import { CheckCircle, Shield, Clock, Truck } from "lucide-react";

const perks = [
  { icon: Truck,        text: "Free pickup & delivery 28+ lbs" },
  { icon: Clock,        text: "24-hr turnaround" },
  { icon: Shield,       text: "100% satisfaction guaranteed" },
  { icon: CheckCircle,  text: "Email & WhatsApp confirmation" },
];

export default function BookPage() {
  return (
    <div className="min-h-screen bg-[#111921] pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-12 items-start">

          {/* Left info panel */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-28">
            <div>
              <p className="eyebrow">Book a Pickup</p>
              <h1 className="text-3xl font-bold font-heading text-white leading-tight">
                Clean laundry,<br />zero effort
              </h1>
              <p className="mt-3 text-white/50 leading-relaxed text-sm font-body">
                Book in under 2 minutes. We pick up, wash, and deliver — you enjoy your free time.
              </p>
            </div>

            <ul className="space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-white/60 font-body">
                  <div className="h-8 w-8 rounded-full bg-mint/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-mint" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <div className="rounded-2xl bg-[#0a3547] border border-mint/15 p-5">
              <p className="text-sm font-semibold text-white mb-1 font-heading">First time booking?</p>
              <p className="text-xs text-white/50 leading-relaxed font-body">
                No account needed. We&apos;ll send your order ID to your email and WhatsApp right after booking.
                Use it to track your order anytime.
              </p>
            </div>
          </div>

          {/* Right: booking form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl bg-white border border-white/10 shadow-[0_8px_48px_rgba(0,0,0,0.3)] p-6 sm:p-8">
              <BookingFlow />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
