"use client";

import { useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithMagicLink } from "@/lib/supabase/auth";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useTranslation } from "@/lib/i18n/translations";
import LanguageToggle from "@/components/LanguageToggle";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const { user, loading } = useSupabaseUser();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

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
      <div className="mb-4">
        <LanguageToggle />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-stone-800">{t("appName")}</h1>
      <p className="mt-1 text-sm text-stone-600">{t("signInToShare")}</p>

      {!isSupabaseConfigured && (
        <div className="mt-6 w-full rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{t("demoModeNotice")}</div>
      )}

      {isSupabaseConfigured && !loading && user && (
        <div className="mt-6 w-full rounded-2xl bg-white/80 p-5 shadow-sm">
          <p className="text-sm text-stone-600">{t("signedInAs", { email: user.email ?? "" })}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
          >
            {t("goToTree")}
          </Link>
        </div>
      )}

      {isSupabaseConfigured && !loading && !user && (
        <form onSubmit={handleSubmit} className="mt-6 w-full space-y-3">
          {status === "sent" ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{t("checkEmailForLink", { email })}</div>
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
                {status === "sending" ? t("sending") : t("sendMagicLink")}
              </button>
              {status === "error" && error && <p className="text-xs text-rose-500">{error}</p>}
            </>
          )}
        </form>
      )}

      <Link href="/" className="mt-6 text-xs text-stone-400 hover:text-stone-600">
        {t("backToTreeArrow")}
      </Link>
    </div>
  );
}
