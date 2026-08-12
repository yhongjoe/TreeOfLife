"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BackgroundLayer from "@/components/BackgroundLayer";
import Tree from "@/components/Tree";
import DailyCardList from "@/components/DailyCardList";
import TestimonyModal from "@/components/TestimonyModal";
import LanguageToggle from "@/components/LanguageToggle";
import { SCHEDULE, TOTAL_DAYS, getCurrentJourneyDay, JOURNEY_START_DATE, formatDayDate } from "@/lib/schedule";
import { useDayStats, TOTAL_MEMBERS } from "@/lib/dataService";
import { useSession } from "@/lib/useSession";
import { setDisplayName, setDemoRole } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useProfile } from "@/lib/useProfile";
import { signOut } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n/translations";

function JourneyBadge({ currentJourneyDay }: { currentJourneyDay: number | null }) {
  const { t, lang } = useTranslation();

  if (currentJourneyDay === null) {
    return (
      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm">
        {t("journeyBegins", { date: formatDayDate(JOURNEY_START_DATE, lang) })}
      </span>
    );
  }
  if (currentJourneyDay === TOTAL_DAYS) {
    return (
      <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
        {t("conferenceToday")}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-amber-800 shadow-sm">
      {t("dayOfTotal", { day: currentJourneyDay, total: TOTAL_DAYS })}
    </span>
  );
}

function NameBadge() {
  const session = useSession();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.displayName);

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) setDisplayName(draft.trim());
          setEditing(false);
        }}
        className="flex items-center gap-1"
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setEditing(false)}
          placeholder={t("yourNamePlaceholder")}
          maxLength={60}
          className="w-32 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs outline-none focus:border-amber-400"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(session.displayName);
        setEditing(true);
      }}
      className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm transition hover:bg-white"
    >
      {session.displayName ? session.displayName : t("setYourName")}
    </button>
  );
}

function AuthControls() {
  const { user, loading } = useSupabaseUser();
  const { t } = useTranslation();

  if (!isSupabaseConfigured || loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
      >
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600 shadow-sm">
      <span>{user.email}</span>
      <button type="button" onClick={() => signOut()} className="text-stone-400 underline-offset-2 hover:text-stone-600 hover:underline">
        {t("signOut")}
      </button>
    </div>
  );
}

export default function Home() {
  const dayStats = useDayStats();
  const session = useSession();
  const { user: supaUser } = useSupabaseUser();
  const profile = useProfile(supaUser?.id);
  const isAdmin = isSupabaseConfigured ? profile?.role === "admin" : session.role === "admin";
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();

  const currentJourneyDay = getCurrentJourneyDay();
  const backgroundDay = focusedDay ?? currentJourneyDay ?? 1;

  const totalShared = dayStats.reduce((sum, s) => sum + s.participantCount, 0);
  const overallPct = Math.round((totalShared / (TOTAL_MEMBERS * TOTAL_DAYS)) * 100);

  function handleFocusDay(day: number) {
    setFocusedDay(day);
    const el = document.querySelector<HTMLElement>(`[data-day="${day}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setFocusedDay(null), 1800);
  }

  useEffect(() => () => {
    if (clearTimer.current) clearTimeout(clearTimer.current);
  }, []);

  return (
    <BackgroundLayer day={backgroundDay}>
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-stone-800 sm:text-3xl">{t("appName")}</h1>
            <p className="text-sm text-stone-600">{t("appSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageToggle />
            <JourneyBadge currentJourneyDay={currentJourneyDay} />
            <NameBadge />
            <AuthControls />
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-full bg-stone-800 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-stone-700"
              >
                {t("adminPanel")}
              </Link>
            )}
            {!isAdmin && !isSupabaseConfigured && (
              <button
                type="button"
                onClick={() => setDemoRole("admin")}
                title={t("previewAdminTitle")}
                className="rounded-full border border-dashed border-stone-400 px-3 py-1 text-xs font-medium text-stone-500 shadow-sm transition hover:bg-white/60"
              >
                {t("previewAdminDemo")}
              </button>
            )}
          </div>
        </header>

        <section className="mt-6 rounded-3xl bg-white/40 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <Tree dayStats={dayStats} focusedDay={focusedDay} onOpenDay={setSelectedDay} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-center text-xs text-stone-600 sm:text-sm">
            <span>{t("testimoniesSharedAcrossTree", { count: totalShared })}</span>
            <span className="hidden h-4 w-px bg-stone-300 sm:inline-block" />
            <span>{t("overallParticipation", { pct: overallPct })}</span>
          </div>
        </section>

        <section className="mt-10">
          <DailyCardList
            schedule={SCHEDULE}
            dayStats={dayStats}
            focusedDay={focusedDay}
            currentJourneyDay={currentJourneyDay}
            onFocusDay={handleFocusDay}
            onOpenDay={setSelectedDay}
          />
        </section>

        <footer className="mt-12 text-center text-xs text-stone-500">{t("footerText")}</footer>
      </div>

      <TestimonyModal day={selectedDay} onClose={() => setSelectedDay(null)} />
    </BackgroundLayer>
  );
}
