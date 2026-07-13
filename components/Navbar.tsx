"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ArrowRight, LogIn, LayoutDashboard, LogOut, Settings, ChevronLeft } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import Logo from "@/components/Logo";

const links = [
  { href: "/services",     label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about",        label: "About" },
  { href: "/faq",          label: "FAQ" },
  { href: "/contact",      label: "Contact" },
];

export default function Navbar() {
  const pathname                  = usePathname();
  const router                    = useRouter();
  const isHome                    = pathname === "/";
  const [scrolled, setScrolled]   = useState(false);
  const [hidden, setHidden]       = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [acctOpen, setAcctOpen]   = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [isOwner, setIsOwner]     = useState(false);
  const acctRef                   = useRef<HTMLDivElement>(null);
  const lastY                     = useRef(0);
  const { scrollY }               = useScroll();

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsOwner(user?.email === "owner@starex.ca");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setIsOwner(session?.user?.email === "owner@starex.ca");
    });
    return () => subscription.unsubscribe();
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40);
    if (y > lastY.current && y > 100) setHidden(true);
    else setHidden(false);
    lastY.current = y;
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (acctRef.current && !acctRef.current.contains(e.target as Node)) setAcctOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    setUser(null);
    setIsOwner(false);
    window.location.href = "/";
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.charAt(0).toUpperCase()
    : (user?.email ?? "U").charAt(0).toUpperCase();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <>
      <motion.header
        animate={{ y: hidden && !menuOpen ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
          height: scrolled ? "64px" : "72px",
          background: "rgba(36,22,26,0.97)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          transition: "height 0.3s ease",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AnimatePresence>
              {!isHome && (
                <motion.button
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 32 }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  onClick={() => router.back()}
                  aria-label="Go back"
                  style={{
                    background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8,
                    cursor: "pointer", width: 32, height: 32, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.7)", flexShrink: 0, overflow: "hidden",
                  }}
                >
                  <ChevronLeft size={16} />
                </motion.button>
              )}
            </AnimatePresence>
            <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              <motion.div whileHover={{ scale: 1.04 }} transition={{ type: "spring", stiffness: 320, damping: 20 }} style={{ display: "flex", alignItems: "center" }}>
                <Logo color="#FFFFFF" fontSize="1.3rem" />
              </motion.div>
            </a>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex" style={{ alignItems: "center", gap: "4px" }}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  fontFamily: "Kodchasan, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  padding: "6px 14px",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.7)",
                  transition: "color 0.2s, background 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#ffffff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right CTAs */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
            {isOwner ? (
              <>
                <a href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.875rem", padding: "8px 16px", color: "#EBA3B4", textDecoration: "none", border: "1px solid rgba(235,163,180,0.35)", borderRadius: 8 }}>
                  <Settings size={13} /> Console
                </a>
                <button onClick={handleSignOut} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.875rem", padding: "8px 12px", color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}>
                  <LogOut size={13} />
                </button>
              </>
            ) : user ? (
              <div ref={acctRef} style={{ position: "relative" }}>
                <button onClick={() => setAcctOpen(o => !o)} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.875rem", padding: "6px 8px 6px 6px", color: "#fff", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, cursor: "pointer" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#DA6178,#CB3E5E)", color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.75rem" }}>
                    {initials}
                  </span>
                  {firstName}
                </button>
                <AnimatePresence>
                  {acctOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
                      style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, width: 210, background: "#322225", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 6, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
                      {[
                        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                        { href: "/account", icon: Settings, label: "Account settings" },
                      ].map(item => (
                        <a key={item.href} href={item.href} onClick={() => setAcctOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <item.icon size={15} color="#EBA3B4" /> {item.label}
                        </a>
                      ))}
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                      <button onClick={() => { setAcctOpen(false); handleSignOut(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", fontFamily: "Kodchasan, sans-serif", fontSize: "0.875rem" }}>
                        <LogOut size={15} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a href="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.875rem", padding: "8px 16px", color: "rgba(255,255,255,0.65)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, transition: "color 0.2s" }}>
                <LogIn size={13} /> Sign In
              </a>
            )}
            {!isOwner && (
              <a href="/book" className="btn-primary" style={{ gap: 6, fontSize: "0.875rem", padding: "10px 20px" }}>
                Book Now <ArrowRight size={14} />
              </a>
            )}
          </div>

          {/* Hamburger */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.85)", padding: "8px" }}>
            <AnimatePresence mode="wait">
              {menuOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={22} /></motion.div>
                : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu size={22} /></motion.div>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ position: "fixed", inset: 0, zIndex: 490, background: "#241619", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px" }}
          >
            <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 15, opacity: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                >
                  <a href={link.href} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", display: "block", fontSize: "2.5rem", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.35 }}
              style={{ marginTop: "40px", display: "flex", flexDirection: "column", gap: 12 }}>
              {user ? (
                <>
                  <a href="/book" className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setMenuOpen(false)}>
                    Book Pickup <ArrowRight size={14} />
                  </a>
                  <a href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.9rem", padding: "12px 20px", color: "rgba(255,255,255,0.6)", background: "none", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, cursor: "pointer" }}>
                    <LayoutDashboard size={14} /> Dashboard
                  </a>
                  <button onClick={() => { setMenuOpen(false); handleSignOut(); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.9rem", padding: "12px 20px", color: "rgba(255,255,255,0.6)", background: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, cursor: "pointer" }}>
                    <LogOut size={14} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <a href="/book" className="btn-primary" style={{ justifyContent: "center" }} onClick={() => setMenuOpen(false)}>
                    Book Pickup <ArrowRight size={14} />
                  </a>
                  <a href="/auth" onClick={() => setMenuOpen(false)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Kodchasan, sans-serif", fontWeight: 500, fontSize: "0.9rem", padding: "12px 20px", color: "rgba(255,255,255,0.6)", background: "none", textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12 }}>
                    <LogIn size={14} /> Sign In
                  </a>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
