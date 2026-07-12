"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/pricing";

type Mode = "signin" | "signup" | "reset" | "check-email";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowser();
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setMode("check-email");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/dashboard";
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });
        if (error) throw error;
        setMode("check-email");
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "check-email") {
    return (
      <div className="min-h-screen bg-[#111921] flex items-center justify-center px-4 pt-16">
        <div className="max-w-md w-full">
          <div className="card rounded-3xl p-10 text-center">
            <div className="h-16 w-16 rounded-full bg-mint/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-mint" />
            </div>
            <h2 className="text-2xl font-bold text-[#09090B] mb-2 font-heading">Check your email</h2>
            <p className="text-[#52525B] text-sm leading-relaxed mb-6 font-body">
              We sent a link to <strong>{email}</strong>. Click it to confirm your account and get started.
            </p>
            <button onClick={() => setMode("signin")} className="btn-ghost w-full text-[#111921] border-[#111921]/20 hover:border-mint hover:text-mint">
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex pt-16 bg-[#111921]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0a3547] flex-col justify-between p-12 relative overflow-hidden border-r border-white/8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
          <div className="absolute bottom-20 -left-10 h-60 w-60 rounded-full bg-mint/5 blur-3xl" />
        </div>

        <a href="/" className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-mint flex items-center justify-center">
            <Sparkles size={16} className="text-[#0a1a0f]" />
          </div>
          <span className="text-white text-xl font-bold font-heading">{BUSINESS_NAME}</span>
        </a>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 font-heading">
              Your laundry,<br /><span className="display-accent">handled.</span>
            </h2>
            <p className="text-white/50 leading-relaxed font-body">
              Sign in to track your orders, view history, and manage your account — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "📦", text: "Track all your orders in real time" },
              { icon: "📅", text: "Book and reschedule pickups easily" },
              { icon: "💬", text: "Get email & WhatsApp updates" },
              { icon: "🏅", text: "Earn Starex Club loyalty perks" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <span className="text-lg">{icon}</span>
                <span className="text-white/70 text-sm font-body">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/25 text-xs font-body">
          © {new Date().getFullYear()} {BUSINESS_NAME}. Canada.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#111921]">
        <div className="w-full max-w-md">
          <div className="card rounded-3xl p-8 sm:p-10">
            <div className="mb-8">
              <a href="/" className="lg:hidden flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-mint flex items-center justify-center">
                  <Sparkles size={14} className="text-[#0a1a0f]" />
                </div>
                <span className="font-bold text-mint font-heading">{BUSINESS_NAME}</span>
              </a>
              <h1 className="text-2xl font-bold text-[#09090B] font-heading">
                {mode === "signin" && "Welcome back"}
                {mode === "signup" && "Create your account"}
                {mode === "reset" && "Reset your password"}
              </h1>
              <p className="text-[#52525B] text-sm mt-1 font-body">
                {mode === "signin" && "Sign in to manage your orders and account."}
                {mode === "signup" && "Join thousands of Canadians who trust Starex."}
                {mode === "reset" && "Enter your email and we'll send you a reset link."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-[#3F3F46] mb-1.5 font-body">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                    <input
                      className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#3F3F46] mb-1.5 font-body">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                  <input
                    className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode !== "reset" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-[#3F3F46] font-body">Password</label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => setMode("reset")} className="text-xs text-mint hover:underline font-body">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                    <input
                      className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 pr-10 text-sm text-[#09090B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
                      type={showPw ? "text" : "password"}
                      placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={mode === "signup" ? 8 : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#52525B]"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="text-xs text-[#A1A1AA] mt-1 font-body">At least 8 characters</p>
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-body">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#0a1a0f]/30 border-t-[#0a1a0f] animate-spin" />
                    {mode === "signin" ? "Signing in…" : mode === "signup" ? "Creating account…" : "Sending link…"}
                  </span>
                ) : (
                  <>
                    {mode === "signin" && "Sign In"}
                    {mode === "signup" && "Create Account"}
                    {mode === "reset" && "Send Reset Link"}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {mode === "reset" && (
                <button type="button" onClick={() => setMode("signin")} className="btn-ghost w-full text-[#111921] border-[#111921]/20 hover:border-mint hover:text-mint">
                  Back to Sign In
                </button>
              )}
            </form>

            {mode !== "reset" && (
              <div className="mt-6 pt-6 border-t border-[#F4F4F5] text-center">
                <p className="text-sm text-[#71717A] font-body">
                  {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => { setError(null); setMode(mode === "signin" ? "signup" : "signin"); }}
                    className="text-mint font-semibold hover:underline"
                  >
                    {mode === "signin" ? "Sign up free" : "Sign in"}
                  </button>
                </p>
              </div>
            )}

            <p className="mt-4 text-center text-xs text-[#A1A1AA] font-body">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-mint hover:underline">Terms</a> and{" "}
              <a href="/privacy" className="text-mint hover:underline">Privacy Policy</a>.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-white/30 font-body">
            Need help?{" "}
            <a href="mailto:hello@starexlaundry.ca" className="text-mint hover:underline">
              hello@starexlaundry.ca
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
