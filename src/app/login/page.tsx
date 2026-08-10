"use client";

import { useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithMagicLink } from "@/lib/supabase/auth";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const { user, loading } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError(null);
    const { error: sendError } = await signInWithMagicLink(email.trim());
    if (sendError) {
      setError(sendError);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-extrabold text-stone-800">Tree of Light</h1>
      <p className="mt-1 text-sm text-stone-600">Sign in to share your testimony each day.</p>

      {!isSupabaseConfigured && (
        <div className="mt-6 w-full rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
          This deployment is running in local demo mode, so no sign-in is required — everything already works.
          See <code className="rounded bg-white/60 px-1 py-0.5 text-xs">DEPLOYMENT.md</code> to turn on real
          Supabase auth for a live stake deployment.
        </div>
      )}

      {isSupabaseConfigured && !loading && user && (
        <div className="mt-6 w-full rounded-2xl bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-stone-600">
            You&rsquo;re signed in as <span className="font-semibold text-stone-800">{user.email}</span>.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            Go to the Tree
          </Link>
        </div>
      )}

      {isSupabaseConfigured && !loading && !user && (
        <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
          {status === "sent" ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
              Check <span className="font-semibold">{email}</span> for a magic link to finish signing in.
            </div>
          ) : (
            <>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Email me a magic link"}
              </button>
              {status === "error" && error && <p className="text-xs text-rose-500">{error}</p>}
            </>
          )}
        </form>
      )}

      <Link href="/" className="mt-6 text-xs text-stone-400 hover:text-stone-600">
        ← Back to the Tree
      </Link>
    </div>
  );
}
