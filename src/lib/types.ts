export type Role = "member" | "admin";

export interface MissionDay {
  day: number;
  /** ISO date string, e.g. "2026-08-18". Weekday is always derived from this, never hardcoded. */
  date: string;
  speaker: string;
  title: string;
  /**
   * Korean transliteration/translation of speaker and title, for the
   * bilingual UI. Best-effort — not verified against the Church's official
   * Korean-language conference materials, so treat as approximate.
   */
  speakerKo: string;
  titleKo: string;
}

export interface Testimony {
  id: string;
  day: number;
  authorName: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface DayStats {
  day: number;
  participantCount: number;
  /** 0-50 scale. 0 = dark silhouette, 50 = radiant glow (100% of totalMembers participated). */
  brightness: number;
}

export interface Member {
  id: string;
  displayName: string;
  role: Role;
  joinedAt: string;
}

export interface StakeSettings {
  stakeName: string;
  totalMembers: number;
  conferenceDate: string;
}
