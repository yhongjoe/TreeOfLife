"use client";

import { useSession } from "./useSession";
import { useSupabaseUser } from "./useSupabaseUser";
import { isSupabaseConfigured } from "./supabase/client";

/**
 * The identifier that actually owns submitted testimonies for the current
 * visitor — in live mode this is the real Supabase auth user id (what
 * testimonies.user_id is set to on insert), in demo mode it's the local
 * session id. Components must use this (not session.id directly) when
 * checking "is this testimony mine" once Supabase is configured, since
 * session.id is a demo-mode-only local identity that never matches a real
 * auth user id.
 */
export function useCurrentUserId(): string | null {
  const session = useSession();
  const { user } = useSupabaseUser();
  return isSupabaseConfigured ? (user?.id ?? null) : session.id;
}
