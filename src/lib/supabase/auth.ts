"use client";

import { getSupabaseClient, isSupabaseConfigured } from "./client";

/**
 * Sends a Supabase magic-link email. The link redirects to /auth/callback,
 * which hands the visitor back to the app once the session is established.
 * Requires NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (see
 * DEPLOYMENT.md) — a no-op with a friendly error in local demo mode.
 */
export async function signInWithMagicLink(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: "Supabase isn't configured for this deployment. See DEPLOYMENT.md to enable live sign-in." };
  }
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabaseClient()!;
  await supabase.auth.signOut();
}
