"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check for invitation token in URL
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const inviteToken = urlParams?.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        // Login
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login failed");
          return;
        }

        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          if (data.user.isAdmin) {
            router.push("/admin");
          } else {
            router.push("/hub");
          }
        }, 500);
      } else {
        // Register
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            inviteToken: inviteToken || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Registration failed");
          return;
        }

        setMessage(data.message);
        if (!data.requiresApproval) {
          setTimeout(() => setActiveTab("login"), 2000);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex">
      {/* Left side – empty, just gradient */}
      <section className="hidden md:flex flex-1" />

      {/* Right side – auth card */}
      <section className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-sm uppercase tracking-[0.3em] text-slate-400">
            BizCapsule
          </div>

          <div className="bg-slate-900/70 border border-slate-800/60 backdrop-blur-xl shadow-2xl rounded-2xl p-8 space-y-6">
            {/* Tabs: Login / Register */}
            <div className="flex gap-2 rounded-full bg-slate-900/80 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2 transition-all ${
                  activeTab === "login"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 rounded-full px-4 py-2 transition-all ${
                  activeTab === "register"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Register
              </button>
            </div>

            {/* Invitation notice */}
            {inviteToken && activeTab === "register" && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
                ✓ You're registering with an invitation! Your account will be
                auto-approved.
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    activeTab === "login" ? "current-password" : "new-password"
                  }
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={
                    activeTab === "login"
                      ? "Password"
                      : "Password (min 8 characters)"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={activeTab === "login" ? undefined : 8}
                />
              </div>

              {error && (
                <div className="text-red-400 text-xs px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
                  {error}
                </div>
              )}

              {message && (
                <div className="text-emerald-400 text-xs px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-400 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : activeTab === "login"
                    ? "Sign in"
                    : "Sign up"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-xs text-slate-500 text-center">
            By continuing you agree to the terms of use of this internal tool.
          </p>
        </div>
      </section>
    </main>
  );
}
