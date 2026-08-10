import type { DayStats, Testimony } from "@/lib/types";
import { TOTAL_DAYS } from "@/lib/schedule";
import { brightnessFromCount } from "@/lib/background";
import { deriveMemberRoster, type MemberRosterEntry } from "@/lib/roster";

/**
 * Demo data layer used whenever Supabase env vars are not configured (see
 * `src/lib/dataService.ts`). It mimics the shape of the real Postgres tables
 * (testimonies keyed by day) so swapping in the live Supabase adapter later
 * requires no changes to any component.
 *
 * All state lives in localStorage under one namespaced key, with a tiny
 * pub/sub emitter so every hook subscribed to the store re-renders when any
 * tab-local mutation happens (submit, admin reset, etc).
 */

const STORAGE_KEY = "tol_demo_store_v1";
export const TOTAL_MEMBERS = 120;
/** Only days up to this one get seeded demo activity, so the tree visibly
 *  brightens near Day 1 and stays dark further out — demonstrating the
 *  brightness system without requiring the real conference window to have started. */
const DEMO_SEED_THROUGH_DAY = 12;

const FIRST_NAMES = [
  "Sarah", "James", "Maria", "David", "Grace", "Noah", "Emily", "Daniel",
  "Hannah", "Joseph", "Olivia", "Samuel", "Abigail", "Benjamin", "Ruth",
  "Matthew", "Rachel", "Andrew", "Lily", "Caleb", "Sophia", "Isaac",
  "Emma", "Jacob", "Chloe", "Ethan", "Mia", "Nathan", "Ava", "Logan",
];
const LAST_INITIALS = ["A.", "B.", "C.", "D.", "F.", "G.", "H.", "J.", "K.", "L.", "M.", "P.", "R.", "S.", "T.", "W."];

const TESTIMONY_TEMPLATES = [
  "This message reminded me that the Savior knows me by name. I felt so much peace today.",
  "I loved this talk. It helped me want to be a little kinder to my family this week.",
  "I felt the Spirit strongly while reading this one. Grateful for prophets and apostles.",
  "This gave me courage to keep going through a hard week. Thankful for this challenge.",
  "I shared this message with my family at dinner and we had a wonderful conversation.",
  "Such a tender reminder of how much Heavenly Father loves each of us individually.",
  "I've been thinking about this all day. It changed how I want to show up for others.",
  "This helped me recommit to my personal prayers. Small and simple things really do matter.",
  "I felt the Savior's love so clearly today. Excited for Stake Conference!",
  "A short but powerful reminder — I want to be more like the example given in this message.",
];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedDemoData(): Testimony[] {
  const rand = mulberry32(20260818);
  const testimonies: Testimony[] = [];

  for (let day = 1; day <= DEMO_SEED_THROUGH_DAY; day++) {
    const progress = day / DEMO_SEED_THROUGH_DAY;
    const base = TOTAL_MEMBERS * (0.2 + 0.55 * progress);
    const noise = (rand() - 0.5) * TOTAL_MEMBERS * 0.15;
    const count = Math.max(3, Math.min(TOTAL_MEMBERS, Math.round(base + noise)));

    for (let i = 0; i < count; i++) {
      const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
      const last = LAST_INITIALS[Math.floor(rand() * LAST_INITIALS.length)];
      const template = TESTIMONY_TEMPLATES[Math.floor(rand() * TESTIMONY_TEMPLATES.length)];
      const createdAt = new Date(2026, 7, 17 + day, 6 + Math.floor(rand() * 15), Math.floor(rand() * 60)).toISOString();
      testimonies.push({
        id: `seed-${day}-${i}`,
        day,
        authorId: `seed-member-${day}-${i}`,
        authorName: `${first} ${last}`,
        message: template,
        createdAt,
      });
    }
  }
  return testimonies;
}

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * Bumped on every mutation. Read-side caches below key off this so
 * `useSyncExternalStore` (see dataService.ts) always gets a referentially
 * stable snapshot when nothing has changed — required to avoid the
 * "getSnapshot should be cached" infinite-loop pitfall.
 */
let storeVersion = 0;

function notify() {
  storeVersion += 1;
  listeners.forEach((cb) => cb());
}

export function subscribe(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function load(): Testimony[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedDemoData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as Testimony[];
  } catch {
    return [];
  }
}

function save(testimonies: Testimony[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonies));
  notify();
}

let allTestimoniesCache: { version: number; value: Testimony[] } | null = null;
export function getAllTestimonies(): Testimony[] {
  if (allTestimoniesCache && allTestimoniesCache.version === storeVersion) return allTestimoniesCache.value;
  const value = load().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  allTestimoniesCache = { version: storeVersion, value };
  return value;
}

const testimoniesForDayCache = new Map<number, { version: number; value: Testimony[] }>();
export function getTestimoniesForDay(day: number): Testimony[] {
  const cached = testimoniesForDayCache.get(day);
  if (cached && cached.version === storeVersion) return cached.value;
  const value = getAllTestimonies().filter((t) => t.day === day);
  testimoniesForDayCache.set(day, { version: storeVersion, value });
  return value;
}

let dayStatsCache: { version: number; value: DayStats[] } | null = null;
export function getDayStats(): DayStats[] {
  if (dayStatsCache && dayStatsCache.version === storeVersion) return dayStatsCache.value;
  const all = load();
  const stats: DayStats[] = [];
  for (let day = 1; day <= TOTAL_DAYS; day++) {
    const participantCount = all.filter((t) => t.day === day).length;
    stats.push({ day, participantCount, brightness: brightnessFromCount(participantCount, TOTAL_MEMBERS) });
  }
  dayStatsCache = { version: storeVersion, value: stats };
  return stats;
}

export function addTestimony(day: number, authorId: string, authorName: string, message: string): Testimony {
  const all = load();
  const existingIndex = all.findIndex((t) => t.day === day && t.authorId === authorId);
  const entry: Testimony = {
    id: existingIndex >= 0 ? all[existingIndex].id : `local-${day}-${authorId}-${Date.now()}`,
    day,
    authorId,
    authorName,
    message,
    createdAt: new Date().toISOString(),
  };
  if (existingIndex >= 0) {
    all[existingIndex] = entry;
  } else {
    all.push(entry);
  }
  save(all);
  return entry;
}

export function resetDay(day: number) {
  const all = load().filter((t) => t.day !== day);
  save(all);
}

export function resetAll() {
  save([]);
}

export type { MemberRosterEntry };

let rosterCache: { version: number; value: MemberRosterEntry[] } | null = null;
export function getMemberRoster(): MemberRosterEntry[] {
  if (rosterCache && rosterCache.version === storeVersion) return rosterCache.value;
  const value = deriveMemberRoster(load());
  rosterCache = { version: storeVersion, value };
  return value;
}
