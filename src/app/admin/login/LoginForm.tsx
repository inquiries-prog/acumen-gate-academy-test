"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Admin sign-in (SRS 9.1) - email and password, nothing else.
 *
 * Signing in from the browser lets the Supabase client set the session cookies
 * the middleware and Server Actions then read.
 */
export default function LoginForm({ next }: { next: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(signInError.message);

      // Full reload so the middleware picks up the new session cookies.
      window.location.href = next.startsWith("/admin") ? next : "/admin";
    } catch (err) {
      setError(
        err instanceof Error && /invalid/i.test(err.message)
          ? "That email or password isn't right. Please try again."
          : err instanceof Error
            ? err.message
            : "Could not sign in.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-charcoal">acumen</span>
        <span className="rounded bg-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          Admin
        </span>
      </div>

      <div className="card p-7">
        <h1 className="text-xl font-bold">Sign in</h1>
        <p className="mt-1.5 text-sm text-body">Manage your website content and leads.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
