"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";
import type { Role } from "./types";

export interface Profile {
  id: string;
  displayName: string;
  role: Role;
}

/** Reads (and stays subscribed to) the signed-in user's `profiles` row — the
 *  server-enforced source of truth for role, used to gate /admin in live mode. */
export function useProfile(userId: string | null | undefined): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(null);

  // Reset immediately when the signed-in user changes (e.g. sign-out), during
  // render rather than in an effect — see the same pattern in TestimonyModal.
  const [trackedUserId, setTrackedUserId] = useState(userId);
  if (userId !== trackedUserId) {
    setTrackedUserId(userId);
    setProfile(null);
  }

  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;
    const supabase = getSupabaseClient()!;
    let cancelled = false;

    const load = () => {
      supabase
        .from("profiles")
        .select("id, display_name, role")
        .eq("id", userId)
        .single()
        .then(({ data }) => {
          if (cancelled || !data) return;
          setProfile({ id: data.id, displayName: data.display_name, role: data.role });
        });
    };
    load();

    const channel = supabase
      .channel(`public:profiles:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return profile;
}
