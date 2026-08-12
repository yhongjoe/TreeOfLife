"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import LanguageToggle from "@/components/LanguageToggle";
import { SCHEDULE, TOTAL_DAYS, formatDayDate, getMission, getMissionTitle, getMissionSpeaker } from "@/lib/schedule";
import { useAllTestimonies, useMemberRoster, TOTAL_MEMBERS, adminResetDay, adminResetAll } from "@/lib/dataService";
import { exportTestimoniesDocx } from "@/lib/exportDocx";
import { useSession } from "@/lib/useSession";
import { setDemoRole } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useProfile } from "@/lib/useProfile";
import { signOut } from "@/lib/supabase/auth";
import { useTranslation } from "@/lib/i18n/translations";
import type { Language } from "@/lib/language";

const DATE_TIME_LOCALE: Record<Language, string> = { en: "en-US", ko: "ko-KR" };

function AdminGuard({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const { user, loading } = useSupabaseUser();
  const profile = useProfile(user?.id);
  const { t } = useTranslation();

  if (isSupabaseConfigured) {
    if (loading) return null;
    if (profile?.role === "admin") return <>{children}</>;
  } else if (session.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="mb-4">
        <LanguageToggle />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-stone-800">{t("adminsOnly")}</h1>
      <p className="mt-2 text-sm text-stone-600">
        {t("adminsOnlyDesc")}
      </p>
      <div className="mt-5 flex gap-2">
        <Link href="/" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-50">
          {t("backToTree")}
        </Link>
        {isSupabaseConfigured ? (
          !user && (
            <Link href="/login" className="rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700">
              {t("signIn")}
            </Link>
          )
        ) : (
          <button
            type="button"
            onClick={() => setDemoRole("admin")}
            className="rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
          >
            {t("previewAdminDemo")}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
      <p className="text-2xl font-extrabold text-stone-800">{value}</p>
      <p className="text-xs font-medium text-stone-500">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  const allTestimonies = useAllTestimonies();
  const roster = useMemberRoster();
  const session = useSession();
  const { user } = useSupabaseUser();
  const { t, lang } = useTranslation();

  const [dayFilter, setDayFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedResetDay, setSelectedResetDay] = useState<number | null>(null);
  const [pendingResetDay, setPendingResetDay] = useState<number | null>(null);
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return allTestimonies.filter((t) => {
      if (dayFilter !== "all" && t.day !== Number(dayFilter)) return false;
      if (memberFilter.trim() && !t.authorName.toLowerCase().includes(memberFilter.trim().toLowerCase())) return false;
      if (dateFilter && t.createdAt.slice(0, 10) !== dateFilter) return false;
      return true;
    });
  }, [allTestimonies, dayFilter, memberFilter, dateFilter]);

  const totalShared = allTestimonies.length;
  const overallPct = Math.round((totalShared / (TOTAL_MEMBERS * TOTAL_DAYS)) * 100);
  const entryWord = filtered.length === 1 ? t("entry") : t("entries");

  async function handleResetDay() {
    if (pendingResetDay === null) return;
    setBusy(true);
    try {
      await adminResetDay(pendingResetDay);
      setPendingResetDay(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleResetAll() {
    setBusy(true);
    try {
      await adminResetAll();
      setResetAllOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminGuard>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-stone-800">{t("adminPanelTitle")}</h1>
            <p className="text-sm text-stone-500">{t("adminPanelSubtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/" className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-white">
              {t("backToTree")}
            </Link>
            {isSupabaseConfigured ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-full border border-dashed border-stone-400 px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-white"
              >
                {t("signOut")}
                {user?.email ? ` (${user.email})` : ""}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDemoRole("member")}
                className="rounded-full border border-dashed border-stone-400 px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-white"
              >
                {t("exitAdminDemo", { name: session.displayName || t("you") })}
              </button>
            )}
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={t("registeredMembers")} value={String(TOTAL_MEMBERS)} />
          <StatCard label={t("uniqueParticipants")} value={String(roster.length)} />
          <StatCard label={t("testimoniesSubmitted")} value={String(totalShared)} />
          <StatCard label={t("overallParticipationLabel")} value={`${overallPct}%`} />
        </section>

        <section className="mt-8 rounded-2xl bg-white/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-stone-700">{t("testimoniesHeading")}</h2>
            <button
              type="button"
              onClick={() =>
                exportTestimoniesDocx(
                  filtered,
                  lang === "ko" ? "빛의 나무 — 간증 보고서" : "Tree of Light — Testimony Report",
                  lang,
                )
              }
              className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t("exportButton", { count: filtered.length, entryWord })}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">{t("allDays")}</option>
              {SCHEDULE.map((m) => (
                <option key={m.day} value={m.day}>
                  {t("dayLabel", { day: m.day })} — {formatDayDate(m.date, lang)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              placeholder={t("filterByMemberName")}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
            />
            {(dayFilter !== "all" || memberFilter || dateFilter) && (
              <button
                type="button"
                onClick={() => {
                  setDayFilter("all");
                  setMemberFilter("");
                  setDateFilter("");
                }}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>

          <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-stone-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-3 py-2">{t("tableDay")}</th>
                  <th className="px-3 py-2">{t("tableSpeakerTalk")}</th>
                  <th className="px-3 py-2">{t("tableMember")}</th>
                  <th className="px-3 py-2">{t("tableTestimony")}</th>
                  <th className="px-3 py-2">{t("tableSubmitted")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((testimony) => {
                  const mission = getMission(testimony.day);
                  return (
                    <tr key={testimony.id} className="border-t border-stone-100">
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-stone-700">{t("dayLabel", { day: testimony.day })}</td>
                      <td className="max-w-[14rem] px-3 py-2 text-stone-500">
                        {mission ? `${getMissionSpeaker(mission, lang)} — ${getMissionTitle(mission, lang)}` : "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-stone-700">{testimony.authorName}</td>
                      <td className="max-w-sm px-3 py-2 text-stone-600">{testimony.message}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-stone-400">
                        {new Date(testimony.createdAt).toLocaleString(DATE_TIME_LOCALE[lang], { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-stone-400">
                      {t("noTestimoniesMatch")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white/70 p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-bold text-stone-700">{t("memberRosterHeading")}</h2>
          <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-stone-100">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-3 py-2">{t("tableMember")}</th>
                  <th className="px-3 py-2">{t("tableDaysCompleted")}</th>
                  <th className="px-3 py-2">{t("tableLastSubmission")}</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((m) => (
                  <tr key={m.id} className="border-t border-stone-100">
                    <td className="px-3 py-2 font-medium text-stone-700">{m.displayName}</td>
                    <td className="px-3 py-2 text-stone-600">
                      {m.daysCompleted} / {TOTAL_DAYS}
                    </td>
                    <td className="px-3 py-2 text-xs text-stone-400">
                      {m.lastSubmittedAt
                        ? new Date(m.lastSubmittedAt).toLocaleString(DATE_TIME_LOCALE[lang], { dateStyle: "medium", timeStyle: "short" })
                        : "—"}
                    </td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-stone-400">
                      {t("noMembersYet")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-bold text-rose-800">{t("dangerZoneHeading")}</h2>
          <p className="mt-1 text-sm text-rose-700/80">{t("dangerZoneDesc")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={selectedResetDay ?? ""}
              onChange={(e) => setSelectedResetDay(e.target.value ? Number(e.target.value) : null)}
              className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">{t("selectADay")}</option>
              {SCHEDULE.map((m) => (
                <option key={m.day} value={m.day}>
                  {t("dayLabel", { day: m.day })} — {formatDayDate(m.date, lang)}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={selectedResetDay === null}
              onClick={() => setPendingResetDay(selectedResetDay)}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-40"
            >
              {t("resetSelectedDay")}
            </button>
            <span className="mx-1 h-6 w-px bg-rose-200" />
            <button
              type="button"
              onClick={() => setResetAllOpen(true)}
              className="rounded-full border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              {t("resetAll33")}
            </button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={pendingResetDay !== null}
        title={t("resetDayConfirmTitle", { day: pendingResetDay ?? "" })}
        description={t("resetDayConfirmDesc")}
        confirmLabel={t("resetThisDay")}
        danger
        busy={busy}
        onConfirm={handleResetDay}
        onCancel={() => setPendingResetDay(null)}
      />
      <ConfirmDialog
        open={resetAllOpen}
        title={t("resetAllConfirmTitle")}
        description={t("resetAllConfirmDesc")}
        confirmLabel={t("resetEverything")}
        danger
        busy={busy}
        onConfirm={handleResetAll}
        onCancel={() => setResetAllOpen(false)}
      />
    </AdminGuard>
  );
}
