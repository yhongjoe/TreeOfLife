import type { MissionDay } from "./types";

/**
 * The 33-day mission schedule, Aug 18 - Sep 19, 2026.
 * Only ISO dates are stored here — weekday labels are always derived from
 * the date at render time (see `formatDayDate`) rather than hardcoded, so
 * they can never drift out of sync with the calendar.
 */
export const SCHEDULE: MissionDay[] = [
  { day: 1, date: "2026-08-18", speaker: "Dallin H. Oaks", title: "Introduction / Alive in Christ" },
  { day: 2, date: "2026-08-19", speaker: "D. Todd Christofferson", title: "Solemn Assembly & The Character of Christ" },
  { day: 3, date: "2026-08-20", speaker: "Patrick Kearon", title: "About His Business" },
  { day: 4, date: "2026-08-21", speaker: "Kristin M. Yee", title: "Ministering—“That Ye Love One Another; as I Have Loved You”" },
  { day: 5, date: "2026-08-22", speaker: "Clark G. Gilbert", title: "Come Home" },
  { day: 6, date: "2026-08-23", speaker: "David A. Bednar", title: "All Who Have Endured Valiantly" },
  { day: 7, date: "2026-08-24", speaker: "Michael John U. Teh", title: "Follow the Prophet; He Knows the Way" },
  { day: 8, date: "2026-08-25", speaker: "Jorge T. Becerra", title: "Tithing—Putting God First" },
  { day: 9, date: "2026-08-26", speaker: "Henry B. Eyring", title: "Prayers for Peace" },
  { day: 10, date: "2026-08-27", speaker: "Gary E. Stevenson", title: "Lost Luggage, Redeemed Souls" },
  { day: 11, date: "2026-08-28", speaker: "Eduardo F. Ortega", title: "Christ—Author and Finisher of Our Faith" },
  { day: 12, date: "2026-08-29", speaker: "Wan-Liang Wu", title: "“I Will Give Away All My Sins to Know Thee”" },
  { day: 13, date: "2026-08-30", speaker: "David J. Wunderli", title: "Jesus Christ Is Not Our Burden; He Is Our Relief" },
  { day: 14, date: "2026-08-31", speaker: "Gérald Caussé", title: "Love All; Love Each" },
  { day: 15, date: "2026-09-01", speaker: "Brian J. Holmes", title: "Jesus Christ Is the Way" },
  { day: 16, date: "2026-09-02", speaker: "Clement M. Matswagothata", title: "He Knows You by Name" },
  { day: 17, date: "2026-09-03", speaker: "Dieter F. Uchtdorf", title: "Encounter at the Empty Tomb" },
  { day: 18, date: "2026-09-04", speaker: "Emily Belle Freeman", title: "Best Days and Worst Days" },
  { day: 19, date: "2026-09-05", speaker: "Pedro X. Larreal", title: "I Feel My Savior's Love" },
  { day: 20, date: "2026-09-06", speaker: "Edward B. Rowe", title: "Choose Jesus Christ as Your Guide" },
  { day: 21, date: "2026-09-07", speaker: "Ronald A. Rasband", title: "He Is Risen" },
  { day: 22, date: "2026-09-08", speaker: "Dale G. Renlund", title: "Because of Jesus Christ" },
  { day: 23, date: "2026-09-09", speaker: "Thierry K. Mutombo", title: "The Joy of a Covenant Relationship with God" },
  { day: 24, date: "2026-09-10", speaker: "Alan R. Walker", title: "A Peculiar Treasure" },
  { day: 25, date: "2026-09-11", speaker: "Chi Hong (Sam) Wong", title: "Remember “Remember, Remember”" },
  { day: 26, date: "2026-09-12", speaker: "Aaron T. Hall", title: "I Glory in My Jesus" },
  { day: 27, date: "2026-09-13", speaker: "Susan H. Porter", title: "Here Am I, Send Me" },
  { day: 28, date: "2026-09-14", speaker: "Neil L. Andersen", title: "Eternal Marriage is an Eternal Journey" },
  { day: 29, date: "2026-09-15", speaker: "Quentin L. Cook", title: "Keys, Covenants and Easter" },
  { day: 30, date: "2026-09-16", speaker: "Gerrit W. Gong", title: "Abide With Me; 'Tis Eastertide" },
  { day: 31, date: "2026-09-17", speaker: "Ulisses Soares", title: "Bright and Glorious Morning" },
  { day: 32, date: "2026-09-18", speaker: "Jeffrey R. Holland", title: "The Motion of a Hidden Fire" },
  { day: 33, date: "2026-09-19", speaker: "Neil L. Andersen", title: "The Triumph of Hope" },
];

export const TOTAL_DAYS = SCHEDULE.length;
export const CONFERENCE_DATE = SCHEDULE[TOTAL_DAYS - 1].date;
export const JOURNEY_START_DATE = SCHEDULE[0].date;

export function getMission(day: number): MissionDay | undefined {
  return SCHEDULE.find((m) => m.day === day);
}

/** Formats "Tue, Aug 18" from an ISO date — weekday is always computed, never stored. */
export function formatDayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatDayDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/**
 * Returns the current in-journey day number (1-33) based on real calendar time,
 * or null if today falls outside the 33-day window entirely.
 */
export function getCurrentJourneyDay(now: Date = new Date()): number | null {
  const todayIso = now.toISOString().slice(0, 10);
  if (todayIso < JOURNEY_START_DATE) return null;
  if (todayIso > CONFERENCE_DATE) return null;
  const startMs = new Date(`${JOURNEY_START_DATE}T00:00:00`).getTime();
  const todayMs = new Date(`${todayIso}T00:00:00`).getTime();
  const diffDays = Math.round((todayMs - startMs) / 86_400_000);
  return Math.min(TOTAL_DAYS, Math.max(1, diffDays + 1));
}

export function generateMissionPrompt(mission: MissionDay): string {
  return `Read or listen to “${mission.title}” by ${mission.speaker}. Then complete today's mission and share a brief testimony of what you learned or felt.`;
}
