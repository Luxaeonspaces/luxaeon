"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const MESSAGES: Record<string, string> = {
  disabled:
    "Your account has been disabled. You cannot use the application. Contact the Founder or Head of IT.",
  deleted:
    "This account has been removed from the application. Contact the Founder or Head of IT if this is unexpected.",
  DISABLED:
    "Your account has been disabled. You cannot sign in. Contact the Founder or Head of IT.",
  DELETED:
    "This account has been deleted or does not exist. Contact the Founder or Head of IT.",
  INVALID: "Incorrect username or password.",
  MISSING: "Enter both username and password.",
  ERROR: "Something went wrong. Try again.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "disabled" || err === "deleted") {
      setError(MESSAGES[err]);
      signOut({ redirect: false });
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const check = await fetch("/api/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await check.json();
      if (!data.ok) {
        setError(MESSAGES[data.code] || MESSAGES.INVALID);
        setLoading(false);
        return;
      }

      const res = await signIn("credentials", { username, password, redirect: false });
      if (res?.error) {
        setError(MESSAGES.INVALID);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(MESSAGES.ERROR);
      setLoading(false);
    }
  }
return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md page-enter">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">Welcome back</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-burgundy">Luxaeon Spaces</h1>
          <p className="mt-2 text-sm text-gray-500">Your studio OS — projects, people & flow</p>
        </div>
<form onSubmit={onSubmit} className="glass-card space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold text-burgundy">Sign in to continue</h2>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Username</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input pr-16"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-burgundy"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-burgundy">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
