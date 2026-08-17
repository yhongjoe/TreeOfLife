"use client";

import { useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signInWithPassword, signUpWithPassword, sendPasswordResetEmail } from "@/lib/supabase/auth";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useTranslation } from "@/lib/i18n/translations";
import LanguageToggle from "@/components/LanguageToggle";

type Mode = "signin" | "signup" | "forgot";
type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const { user, loading } = useSupabaseUser();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showSetPasswordAction, setShowSetPasswordAction] = useState(false);
  const { t } = useTranslation();

  function switchMode(next: Mode) {
    setMode(next);
    setStatus("idle");
    setError(null);
    setInfoMessage(null);
    setShowSetPasswordAction(false);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("sending");
    setError(null);
    const { error: signInError } = await signInWithPassword(email.trim(), password);
    if (signInError) {
      setError(signInError);
      setStatus("error");
    } else {
      setStatus("idle");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
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
    setStatus("sending");
    setError(null);
    const { error: signUpError, needsEmailConfirmation, alreadyRegistered } = await signUpWithPassword(email.trim(), password);
    if (signUpError) {
      setError(signUpError);
      setStatus("error");
      return;
    }
    if (alreadyRegistered) {
      setError(t("emailAlreadyRegistered"));
      setShowSetPasswordAction(true);
      setStatus("error");
      return;
    }
    setInfoMessage(needsEmailConfirmation ? t("accountCreatedCheckEmail", { email }) : t("accountCreatedSignedIn"));
    setStatus("sent");
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setError(null);
    const { error: resetError } = await sendPasswordResetEmail(email.trim());
    if (resetError) {
      setError(resetError);
      setStatus("error");
    } else {
      setInfoMessage(t("resetLinkSent", { email }));
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
        <div className="mt-6 w-full">
          {status === "sent" ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{infoMessage}</div>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-xs font-semibold text-amber-700 underline-offset-2 hover:underline"
              >
                {t("backToSignIn")}
              </button>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-3">
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
                {status === "sending" ? t("sending") : t("sendResetLink")}
              </button>
              {status === "error" && error && <p className="text-xs text-rose-500">{error}</p>}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="block w-full text-xs font-semibold text-stone-500 underline-offset-2 hover:underline"
              >
                {t("backToSignIn")}
              </button>
            </form>
          ) : (
            <>
              <div className="mb-4 flex rounded-full bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                    mode === "signin" ? "bg-white text-amber-700 shadow-sm" : "text-stone-500"
                  }`}
                >
                  {t("signInTab")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                    mode === "signup" ? "bg-white text-amber-700 shadow-sm" : "text-stone-500"
                  }`}
                >
                  {t("createAccountTab")}
                </button>
              </div>

              <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  minLength={6}
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
                />
                {mode === "signup" && (
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    minLength={6}
                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-400"
                  />
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
                >
                  {status === "sending"
                    ? mode === "signin"
                      ? t("signingIn")
                      : t("creatingAccount")
                    : mode === "signin"
                      ? t("signIn")
                      : t("createAccountButton")}
                </button>
                {status === "error" && error && <p className="text-xs text-rose-500">{error}</p>}
                {showSetPasswordAction && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="w-full rounded-full border border-amber-400 px-5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                  >
                    {t("sendResetLink")}
                  </button>
                )}
              </form>

              {mode === "signin" && (
                <div className="mt-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="block w-full text-xs font-semibold text-amber-700 underline-offset-2 hover:underline"
                  >
                    {t("forgotPassword")}
                  </button>
                  <p className="text-[0.7rem] text-stone-400">{t("firstTimeSetPassword")}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Link href="/" className="mt-6 text-xs text-stone-400 hover:text-stone-600">
        {t("backToTreeArrow")}
      </Link>
    </div>
  );
}
