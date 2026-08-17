"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { updatePassword } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n/translations";
import LanguageToggle from "@/components/LanguageToggle";

/**
 * Where Supabase's password-reset email redirects back to. Arriving here
 * with valid recovery tokens in the URL establishes a session automatically
 * (detectSessionInUrl: true, see supabase/client.ts) — this page waits for
 * that, then lets the visitor choose a new password. This is also how
 * accounts originally created via magic link (no password) get one for the
 * first time.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [timedOut, setTimedOut] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => router.replace("/"), 2500);
    return () => clearTimeout(timer);
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setStatus("error");
      return;
    }
    if (password.length < 6) {
      setError(t("passwordTooShort"));
      setStatus("error");
      return;
    }
    setStatus("saving");
    setError(null);
    const { error: updateError } = await updatePassword(password);
    if (updateError) {
      setError(updateError);
      setStatus("error");
    } else {
      setStatus("saved");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className="mb-4">
        <LanguageToggle />
      </div>

      {loading || (!user && !timedOut) ? (
        <p className="text-sm text-stone-500">{t("signingYouIn")}</p>
      ) : !user ? (
        <div className="text-sm text-stone-600">
          <p>{t("invalidOrExpiredRecoveryLink")}</p>
          <Link href="/login" className="mt-3 inline-block font-semibold text-amber-700 underline">
            {t("trySigningInAgain")}
          </Link>
        </div>
      ) : status === "saved" ? (
        <div className="w-full rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{t("passwordSaved")}</div>
      ) : (
        <div className="w-full">
          <h1 className="font-display text-xl font-extrabold text-stone-800">{t("setNewPassword")}</h1>
          <p className="mt-1 text-sm text-stone-600">{t("setNewPasswordDesc")}</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("newPasswordPlaceholder")}
              minLength={6}
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
            />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              minLength={6}
              className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {status === "saving" ? t("sending") : t("savePassword")}
            </button>
            {status === "error" && error && <p className="text-xs text-rose-500">{error}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
