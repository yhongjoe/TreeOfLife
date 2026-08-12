"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useTranslation } from "@/lib/i18n/translations";

/**
 * Where Supabase's magic-link email redirects back to. The Supabase client
 * (created with default options, see src/lib/supabase/client.ts) has
 * `detectSessionInUrl: true` in the browser, so it parses the auth tokens out
 * of the URL and establishes the session automatically — this page just
 * waits for `useSupabaseUser` to reflect that, then sends the visitor home.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [timedOut, setTimedOut] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      {!timedOut || loading ? (
        <p className="text-sm text-stone-500">{t("signingYouIn")}</p>
      ) : (
        <div className="text-sm text-stone-600">
          <p>{t("linkExpired")}</p>
          <Link href="/login" className="mt-3 inline-block font-semibold text-amber-700 underline">
            {t("trySigningInAgain")}
          </Link>
        </div>
      )}
    </div>
  );
}
