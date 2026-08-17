"use client";

import { getSupabaseClient, isSupabaseConfigured } from "./client";

const NOT_CONFIGURED_ERROR = "Supabase isn't configured for this deployment. See DEPLOYMENT.md to enable live sign-in.";

/**
 * Password-based sign-in — the primary flow. Requires
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (see
 * DEPLOYMENT.md) — a no-op with a friendly error in local demo mode.
 */
export async function signInWithPassword(email: string, password: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/**
 * Creates a new account with a password. Supabase's default "Confirm email"
 * setting still applies — see DEPLOYMENT.md — so this may require the user
 * to click a one-time confirmation link before their first sign-in works;
 * `needsEmailConfirmation` tells the UI which message to show.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null; needsEmailConfirmation: boolean }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR, needsEmailConfirmation: false };
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) return { error: error.message, needsEmailConfirmation: false };
  return { error: null, needsEmailConfirmation: !data.session };
}

/**
 * Sends a one-time password-set/reset link. This is also how accounts
 * originally created via magic link (which have no password) establish one
 * for the first time — after following the link once, they can sign in
 * with email + password from then on, with no more emails needed.
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { error: error?.message ?? null };
}

/** Finalizes a password-set/reset — called from /auth/reset-password once the recovery link has been followed. */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED_ERROR };
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = getSupabaseClient()!;
  await supabase.auth.signOut();
}
