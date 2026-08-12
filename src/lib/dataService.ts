"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { DayStats, Testimony } from "./types";
import * as mock from "@/data/mockStore";
import type { MemberRosterEntry } from "@/lib/roster";
import { deriveMemberRoster } from "@/lib/roster";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase/client";

export const TOTAL_MEMBERS = mock.TOTAL_MEMBERS;

const EMPTY_TESTIMONIES: Testimony[] = [];

// ---------------------------------------------------------------------------
// Live (Supabase) query functions. These are fully implemented against the
// schema in supabase/schema.sql and only ever run once NEXT_PUBLIC_SUPABASE_URL
// / NEXT_PUBLIC_SUPABASE_ANON_KEY are set — see DEPLOYMENT.md.
// ---------------------------------------------------------------------------

async function liveGetDayStats(): Promise<DayStats[]> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase.from("daily_stats").select("day, participant_count, brightness").order("day");
  if (error) throw error;
  return (data ?? []).map((row) => ({ day: row.day, participantCount: row.participant_count, brightness: row.brightness }));
}

async function liveGetTestimonies(day: number): Promise<Testimony[]> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("testimonies")
    .select("id, day, user_id, author_name, message, created_at")
    .eq("day", day)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    day: row.day,
    authorId: row.user_id,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
  }));
}

async function liveGetTestimoniesPreview(day: number, limit: number): Promise<Testimony[]> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("testimonies")
    .select("id, day, user_id, author_name, message, created_at")
    .eq("day", day)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    day: row.day,
    authorId: row.user_id,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
  }));
}

async function liveGetAllTestimonies(): Promise<Testimony[]> {
  const supabase = getSupabaseClient()!;
  const { data, error } = await supabase
    .from("testimonies")
    .select("id, day, user_id, author_name, message, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    day: row.day,
    authorId: row.user_id,
    authorName: row.author_name,
    message: row.message,
    createdAt: row.created_at,
  }));
}

async function liveSubmitTestimony(day: number, authorName: string, message: string): Promise<void> {
  const supabase = getSupabaseClient()!;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Sign in required to submit a testimony (see DEPLOYMENT.md for enabling Supabase Auth).");
  const { error } = await supabase
    .from("testimonies")
    .upsert({ day, user_id: auth.user.id, author_name: authorName, message }, { onConflict: "day,user_id" });
  if (error) throw error;
}

async function liveResetDay(day: number): Promise<void> {
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.from("testimonies").delete().eq("day", day);
  if (error) throw error;
}

async function liveResetAll(): Promise<void> {
  const supabase = getSupabaseClient()!;
  const { error } = await supabase.from("testimonies").delete().neq("day", -1);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// React hooks consumed by components. Each picks mock vs. live transparently.
// ---------------------------------------------------------------------------

/**
 * Each hook below reads the mock store through `useSyncExternalStore` (the
 * store already caches snapshots per version, so this never re-renders
 * needlessly and never sets state synchronously inside an effect body). The
 * live Supabase path is a plain effect where every `setState` call happens
 * inside a promise callback or a realtime event callback — never directly
 * in the effect body — which is what keeps it clear of that same pitfall.
 */

export function useDayStats(): DayStats[] {
  const mockStats = useSyncExternalStore(mock.subscribe, mock.getDayStats, mock.getDayStats);
  const [liveStats, setLiveStats] = useState<DayStats[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = getSupabaseClient()!;
    const load = () => {
      liveGetDayStats()
        .then((s) => !cancelled && setLiveStats(s))
        .catch(console.error);
    };
    load();
    const channel = supabase
      .channel("public:testimonies:stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonies" }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return isSupabaseConfigured ? liveStats : mockStats;
}

export function useTestimonies(day: number | null): { testimonies: Testimony[]; loading: boolean } {
  const mockTestimonies = useSyncExternalStore(
    mock.subscribe,
    () => (day === null ? EMPTY_TESTIMONIES : mock.getTestimoniesForDay(day)),
    () => (day === null ? EMPTY_TESTIMONIES : mock.getTestimoniesForDay(day)),
  );
  const [liveTestimonies, setLiveTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || day === null) return;
    let cancelled = false;
    const supabase = getSupabaseClient()!;
    const load = () => {
      setLoading(true);
      liveGetTestimonies(day)
        .then((t) => !cancelled && setLiveTestimonies(t))
        .catch(console.error)
        .finally(() => !cancelled && setLoading(false));
    };
    load();
    const channel = supabase
      .channel(`public:testimonies:day-${day}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonies", filter: `day=eq.${day}` }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [day]);

  if (!isSupabaseConfigured) return { testimonies: mockTestimonies, loading: false };
  return { testimonies: day === null ? EMPTY_TESTIMONIES : liveTestimonies, loading };
}

/**
 * Lightweight hover/preview variant of useTestimonies — fetches at most
 * `limit` rows once per `day` change and never opens a Realtime channel.
 *
 * The full useTestimonies hook opens a live-subscribed WebSocket channel
 * named `public:testimonies:day-${day}`. It's only meant to be used by the
 * open TestimonyModal (one at a time). The tooltip preview used to call the
 * same hook, which meant that on mobile — where a single tap fires both a
 * synthetic `mouseenter` and a `click` for the same fruit almost
 * simultaneously — two different components briefly subscribed to a
 * channel with the *same* topic name for the *same* day at once. That
 * collision could spiral into a churn of duplicate/retrying realtime
 * connections and reliably crashed the tab on mobile browsers. The tooltip
 * only ever renders 2 testimonies and doesn't need to be live, so it now
 * uses this one-shot, subscription-free fetch instead.
 */
export function useTestimonyPreview(day: number | null, limit = 2): Testimony[] {
  const mockPreview = useSyncExternalStore(
    mock.subscribe,
    () => (day === null ? EMPTY_TESTIMONIES : mock.getTestimoniesForDay(day).slice(0, limit)),
    () => (day === null ? EMPTY_TESTIMONIES : mock.getTestimoniesForDay(day).slice(0, limit)),
  );
  const [livePreview, setLivePreview] = useState<Testimony[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured || day === null) return;
    let cancelled = false;
    liveGetTestimoniesPreview(day, limit)
      .then((t) => !cancelled && setLivePreview(t))
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [day, limit]);

  if (!isSupabaseConfigured) return mockPreview;
  return day === null ? EMPTY_TESTIMONIES : livePreview;
}

export async function submitTestimony(day: number, authorId: string, authorName: string, message: string): Promise<void> {
  if (isSupabaseConfigured) {
    await liveSubmitTestimony(day, authorName, message);
  } else {
    mock.addTestimony(day, authorId, authorName, message);
  }
}

export function useMemberRoster(): MemberRosterEntry[] {
  const mockRoster = useSyncExternalStore(mock.subscribe, mock.getMemberRoster, mock.getMemberRoster);
  const [liveRoster, setLiveRoster] = useState<MemberRosterEntry[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = getSupabaseClient()!;
    const load = () => {
      liveGetAllTestimonies()
        .then((all) => !cancelled && setLiveRoster(deriveMemberRoster(all)))
        .catch(console.error);
    };
    load();
    const channel = supabase
      .channel("public:testimonies:roster")
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonies" }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return isSupabaseConfigured ? liveRoster : mockRoster;
}

/** Reactive, live-updating full testimony list — used by the admin dashboard. */
export function useAllTestimonies(): Testimony[] {
  const mockAll = useSyncExternalStore(mock.subscribe, mock.getAllTestimonies, mock.getAllTestimonies);
  const [liveAll, setLiveAll] = useState<Testimony[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = getSupabaseClient()!;
    const load = () => {
      liveGetAllTestimonies()
        .then((all) => !cancelled && setLiveAll(all))
        .catch(console.error);
    };
    load();
    const channel = supabase
      .channel("public:testimonies:admin-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonies" }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return isSupabaseConfigured ? liveAll : mockAll;
}

export async function getAllTestimoniesForExport(): Promise<Testimony[]> {
  return isSupabaseConfigured ? liveGetAllTestimonies() : mock.getAllTestimonies();
}

export async function adminResetDay(day: number): Promise<void> {
  if (isSupabaseConfigured) {
    await liveResetDay(day);
  } else {
    mock.resetDay(day);
  }
}

export async function adminResetAll(): Promise<void> {
  if (isSupabaseConfigured) {
    await liveResetAll();
  } else {
    mock.resetAll();
  }
}
