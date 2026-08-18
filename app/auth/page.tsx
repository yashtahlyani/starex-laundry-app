"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { isOwnerUser } from "@/lib/owner";
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/pricing";
import Logo from "@/components/Logo";

type Mode = "signin" | "signup" | "reset" | "check-email" | "new-password";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (m === "new-password") setMode("new-password");
    const err = params.get("error");
    if (err) setError("Authentication failed. Please try signing in again.");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowser();
    try {
      if (mode === "signup") {
        if (!agreedToTerms) throw new Error("Please accept the Terms & Conditions and Privacy Policy to continue.");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              // Recorded per CASL's evidentiary requirement to be able to show
              // how and when marketing consent was (or wasn't) obtained.
              terms_accepted_at: new Date().toISOString(),
              marketing_consent: marketingConsent,
              marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
            },
          },
        });
        if (error) throw error;
        setMode("check-email");
      } else if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const isOwner = isOwnerUser(data.user);
        window.location.href = isOwner ? "/admin" : "/dashboard";
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });
        if (error) throw error;
        setMode("check-email");
      } else if (mode === "new-password") {
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.location.href = "/dashboard";
        return;
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "new-password") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center px-4 relative">
        <a href="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#4A4A4A] hover:text-[#ED1D24] transition-colors font-body">
          <ArrowLeft size={15} /> Back to Home
        </a>
        <div className="max-w-md w-full">
          <div className="card rounded-3xl p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#161616] font-heading">Set new password</h1>
              <p className="text-[#6B6B6B] text-sm mt-1 font-body">Choose a strong password for your account.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3F3F46] mb-1.5 font-body">New password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                  <input
                    className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 pr-10 text-sm text-[#161616] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#6B6B6B]">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3F3F46] mb-1.5 font-body">Confirm password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                  <input
                    className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 text-sm text-[#161616] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
                    type={showPw ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-body">{error}</div>
              )}
              <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] animate-spin" />
                    Updating…
                  </span>
                ) : (
                  <>Update Password <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "check-email") {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card rounded-3xl p-10 text-center">
            <div className="h-16 w-16 rounded-full bg-mint/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-mint" />
            </div>
            <h2 className="text-2xl font-bold text-[#161616] mb-2 font-heading">Check your email</h2>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6 font-body">
              We sent a link to <strong>{email}</strong>. Click it to confirm your account and get started.
            </p>
            <button onClick={() => setMode("signin")} className="btn-ghost w-full text-[#161616] border-[#161616]/20 hover:border-mint hover:text-mint">
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FFFFFF]">
      {/* Left brand panel — flat brand red, echoes the homepage hero split */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#ED1D24] flex-col justify-between p-12 relative overflow-hidden">
        <a href="/" className="relative flex items-center">
          <Logo color="#FFFFFF" fontSize="2.75rem" />
        </a>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 font-heading">
              Your laundry,<br /><span className="italic">handled.</span>
            </h2>
            <p className="text-white/85 leading-relaxed font-body">
              Sign in to track your orders, view history, and manage your account — all in one place.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "📦", text: "Track all your orders in real time" },
              { icon: "📅", text: "Book and reschedule pickups easily" },
              { icon: "💬", text: "Get email & WhatsApp updates" },
              { icon: "🏅", text: "Unlock StareX Monthly Plan perks" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span className="text-lg">{icon}</span>
                <span className="text-white/90 text-sm font-body">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/60 text-xs font-body">
          © {new Date().getFullYear()} {BUSINESS_NAME}. Canada.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FFFFFF] relative">
        <a href="/" className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#4A4A4A] hover:text-[#ED1D24] transition-colors font-body">
          <ArrowLeft size={15} /> Back to Home
        </a>
        <div className="w-full max-w-md">
          <div className="card rounded-3xl p-8 sm:p-10">
            <div className="mb-8">
              <a href="/" className="lg:hidden flex items-center mb-6">
                <Logo color="#ED1D24" fontSize="2.25rem" />
              </a>
              <h1 className="text-2xl font-bold text-[#161616] font-heading">
                {mode === "signin" && "Welcome back"}
                {mode === "signup" && "Create your account"}
                {mode === "reset" && "Reset your password"}
              </h1>
              <p className="text-[#6B6B6B] text-sm mt-1 font-body">
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
                      className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 text-sm text-[#161616] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
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
                    className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 text-sm text-[#161616] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
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
                      className="w-full rounded-xl border border-[#E4E4E7] bg-white px-4 py-3 pl-10 pr-10 text-sm text-[#161616] placeholder:text-[#A1A1AA] focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/20 transition-all font-body"
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#6B6B6B]"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {mode === "signup" && (
                    <p className="text-xs text-[#A1A1AA] mt-1 font-body">At least 8 characters</p>
                  )}
                </div>
              )}

              {mode === "signup" && (
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox" checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-mint"
                      required
                    />
                    <span className="text-sm text-[#4A4A4A] font-body leading-snug">
                      I agree to StareX's{" "}
                      <a href="/terms" target="_blank" className="text-mint underline">Terms &amp; Conditions</a>,{" "}
                      <a href="/privacy" target="_blank" className="text-mint underline">Privacy Policy</a>, and{" "}
                      <a href="/refund-policy" target="_blank" className="text-mint underline">Refund, Cancellation &amp; Damage Policy</a>.
                    </span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox" checked={marketingConsent}
                      onChange={e => setMarketingConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-mint"
                    />
                    <span className="text-sm text-[#8C8C8C] font-body leading-snug">
                      Send me occasional promotions and updates by email. You can unsubscribe anytime — optional, not required to create an account.
                    </span>
                  </label>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700 font-body">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full mt-2" disabled={loading || (mode === "signup" && !agreedToTerms)}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] animate-spin" />
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
                <button type="button" onClick={() => setMode("signin")} className="btn-ghost w-full text-[#161616] border-[#161616]/20 hover:border-mint hover:text-mint">
                  Back to Sign In
                </button>
              )}
            </form>

            {mode !== "reset" && (
              <div className="mt-6 pt-6 border-t border-[#F4F4F5] text-center">
                <p className="text-sm text-[#8C8C8C] font-body">
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

            {mode !== "signup" && (
              <p className="mt-4 text-center text-xs text-[#A1A1AA] font-body">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-mint hover:underline">Terms</a>,{" "}
                <a href="/privacy" className="text-mint hover:underline">Privacy Policy</a>, and{" "}
                <a href="/refund-policy" className="text-mint hover:underline">Refund Policy</a>.
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-white/30 font-body">
            Need help?{" "}
            <a href="mailto:hello@starexlaundrydryclean.ca" className="text-mint hover:underline">
              hello@starexlaundrydryclean.ca
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
