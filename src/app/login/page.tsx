"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { isAuthenticated, loginWithCredentials } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If the user is already authenticated, skip the form.
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground"
            style={{ fontWeight: 700 }}
          >
            M
          </div>
          <span className="text-xl" style={{ fontWeight: 700 }}>
            Menu Gap
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl shadow-[0_8px_32px_rgba(127,85,57,0.08)]">
          <div className="mb-6">
            <h1 className="mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Login to view your menu intelligence dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cafe.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#B08968] text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-wider text-muted-foreground"
                style={{ fontWeight: 600 }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-[#B08968] text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-[#D57A66] bg-[#F8ECE8] border border-[#EBCEC4] rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              style={{ fontWeight: 600 }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
