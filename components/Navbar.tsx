"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sparkles, User, LogOut, LayoutDashboard } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/pricing";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

const links = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/services#pricing" },
  { label: "Track Order", href: "/order" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    handler();

    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => { window.removeEventListener("scroll", handler); subscription.unsubscribe(); };
  }, []);

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#111921]/95 backdrop-blur-md border-b border-white/8 shadow-[0_1px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-mint text-[#0a1a0f] shadow-mint group-hover:scale-105 transition-transform">
              <Sparkles size={15} />
            </div>
            <span className="text-lg font-bold text-white font-heading tracking-tight">
              {BUSINESS_NAME}
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all duration-200 font-body"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Auth + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white/75 hover:text-white hover:bg-white/8 transition-all"
                >
                  <div className="h-7 w-7 rounded-full bg-mint flex items-center justify-center text-[#0a1a0f] text-xs font-bold">
                    {(user.user_metadata?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <span className="hidden lg:block max-w-[120px] truncate">
                    {user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a2332] rounded-2xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] py-2 z-20 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-white/8">
                        <p className="text-xs text-white/35">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                      </div>
                      <a href="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/65 hover:text-mint hover:bg-white/5 transition-colors">
                        <LayoutDashboard size={14} /> My Orders
                      </a>
                      <a href="/book" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/65 hover:text-mint hover:bg-white/5 transition-colors">
                        <Sparkles size={14} /> Book a Pickup
                      </a>
                      <div className="border-t border-white/8 mt-1">
                        <button onClick={handleSignOut}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a
                href="/auth"
                className="flex items-center gap-1.5 text-sm font-medium text-white/65 hover:text-white px-4 py-2 rounded-full hover:bg-white/8 transition-all font-body"
              >
                <User size={14} /> Sign In
              </a>
            )}
            <a href="/book" className="btn-primary text-sm px-5 py-2.5">
              Book a Pickup
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-full text-white/75 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-[#111921]/98 backdrop-blur-md border-t border-white/8 px-4 py-4 shadow-lg space-y-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-2xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/8 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/8 space-y-2">
            {user ? (
              <>
                <a href="/dashboard" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white/65 hover:text-mint hover:bg-white/5 transition-colors">
                  <LayoutDashboard size={15} /> My Orders
                </a>
                <button onClick={() => { handleSignOut(); setOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <a href="/auth" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/8 transition-colors">
                <User size={15} /> Sign In / Create Account
              </a>
            )}
            <a href="/book" onClick={() => setOpen(false)} className="btn-primary w-full text-center">
              Book a Pickup
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
