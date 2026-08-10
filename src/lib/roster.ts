import type { Testimony } from "./types";

export interface MemberRosterEntry {
  id: string;
  displayName: string;
  daysCompleted: number;
  lastSubmittedAt: string | null;
}

/** Shared by both the mock store and the live Supabase adapter so the admin
 *  roster view behaves identically regardless of data source. */
export function deriveMemberRoster(testimonies: Testimony[]): MemberRosterEntry[] {
  const byMember = new Map<string, MemberRosterEntry>();
  for (const t of testimonies) {
    const existing = byMember.get(t.authorId);
    if (existing) {
      existing.daysCompleted += 1;
      if (!existing.lastSubmittedAt || t.createdAt > existing.lastSubmittedAt) {
        existing.lastSubmittedAt = t.createdAt;
      }
    } else {
      byMember.set(t.authorId, {
        id: t.authorId,
        displayName: t.authorName,
        daysCompleted: 1,
        lastSubmittedAt: t.createdAt,
      });
    }
  }
  return Array.from(byMember.values()).sort((a, b) => b.daysCompleted - a.daysCompleted);
}
