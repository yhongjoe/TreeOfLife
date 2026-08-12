"use client";

import { useEffect, useState } from "react";
import { formatDayDateLong, generateMissionPrompt, getMission, getMissionTitle, getMissionSpeaker, CONFERENCE_LINKS } from "@/lib/schedule";
import { submitTestimony, useTestimonies } from "@/lib/dataService";
import { useSession } from "@/lib/useSession";
import { setDisplayName } from "@/lib/session";
import { useCurrentUserId } from "@/lib/useCurrentUserId";
import { useTranslation, translate } from "@/lib/i18n/translations";
import type { Language } from "@/lib/language";

interface TestimonyModalProps {
  day: number | null;
  onClose: () => void;
}

function timeAgo(iso: string, lang: Language): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return translate(lang, "justNow");
  if (mins < 60) return translate(lang, "minutesAgo", { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return translate(lang, "hoursAgo", { n: hours });
  return translate(lang, "daysAgo", { n: Math.round(hours / 24) });
}

/**
 * Opens the official conference session page as a genuine separate popup
 * window (not an in-page iframe embed — the Church site, like most large
 * institutional sites, is likely to block being framed via
 * X-Frame-Options/CSP, so an iframe would silently fail). This is a link to
 * the confirmed real session index page, not a per-talk deep link — see the
 * comment on CONFERENCE_LINKS in schedule.ts for why individual talk URLs
 * aren't generated.
 *
 * Uses "_blank" rather than a fixed reused window name — a fixed name
 * (e.g. "conference-talk") makes the browser try to reuse/refocus the same
 * window on every click, which silently does nothing once that window has
 * been closed (confirmed: worked once, then never again on repeat clicks).
 * "_blank" always opens a fresh window/tab.
 */
function openConferenceLink(lang: Language) {
  window.open(CONFERENCE_LINKS[lang], "_blank", "width=480,height=800,noopener,noreferrer");
}

export default function TestimonyModal({ day, onClose }: TestimonyModalProps) {
  const mission = day ? getMission(day) : undefined;
  const { testimonies, loading } = useTestimonies(day);
  const session = useSession();
  const currentUserId = useCurrentUserId();
  const { t, lang } = useTranslation();

  const [name, setName] = useState(session.displayName);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep `name` synced to the session's display name whenever it changes
  // externally (e.g. edited in the header while this modal is open), without
  // clobbering it on every render — adjusted during render, not in an effect.
  const [syncedDisplayName, setSyncedDisplayName] = useState(session.displayName);
  if (session.displayName !== syncedDisplayName) {
    setSyncedDisplayName(session.displayName);
    setName(session.displayName);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!day || !mission) return null;

  const myTestimony = testimonies.find((t) => t.authorId === currentUserId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !day) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitTestimony(day, session.id, name.trim(), message.trim());
      setDisplayName(name.trim());
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-[#fffaf0] shadow-2xl animate-modal-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("dayLabel", { day: mission.day })}
      >
        <div className="relative shrink-0 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 px-6 pb-5 pt-6">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-stone-600 transition hover:bg-white"
          >
            ✕
          </button>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
            {t("dayOfTotalDate", { day: mission.day, date: formatDayDateLong(mission.date, lang) })}
          </p>
          <h2 className="mt-1 text-xl font-bold leading-snug text-stone-800">{getMissionTitle(mission, lang)}</h2>
          <p className="text-sm text-stone-600">{getMissionSpeaker(mission, lang)}</p>
          <p className="mt-2 text-sm italic text-stone-700/90">{generateMissionPrompt(mission, lang)}</p>
          <button
            type="button"
            onClick={() => openConferenceLink(lang)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-white"
          >
            📖 {t("readFullTalk")}
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          {loading && <p className="text-sm text-stone-400">{t("loadingTestimonies")}</p>}
          {!loading && testimonies.length === 0 && <p className="text-sm italic text-stone-400">{t("noTestimoniesYet")}</p>}
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-stone-800">{testimony.authorName}</span>
                <span className="text-[0.7rem] text-stone-400">{timeAgo(testimony.createdAt, lang)}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-stone-600">{testimony.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="shrink-0 space-y-2 border-t border-amber-200/70 bg-white/60 px-6 py-4">
          <p className="text-xs font-semibold text-stone-500">{myTestimony ? t("updateYourTestimony") : t("shareYourTestimony")}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("yourNamePlaceholder")}
            maxLength={60}
            required
            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={myTestimony?.message ?? t("whatDidYouLearn")}
            maxLength={320}
            rows={3}
            required
            className="w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-stone-400">{message.length}/320</span>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? t("sharing") : myTestimony ? t("update") : t("share")}
            </button>
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}
