"use client";

import { formatDayDate, getMissionTitle, getMissionSpeaker } from "@/lib/schedule";
import type { MissionDay, DayStats } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/translations";

interface DailyCardListProps {
  schedule: MissionDay[];
  dayStats: DayStats[];
  focusedDay: number | null;
  currentJourneyDay: number | null;
  onFocusDay: (day: number) => void;
  onOpenDay: (day: number) => void;
}

export default function DailyCardList({
  schedule,
  dayStats,
  focusedDay,
  currentJourneyDay,
  onFocusDay,
  onOpenDay,
}: DailyCardListProps) {
  const statsByDay = new Map(dayStats.map((s) => [s.day, s]));
  const { t, lang } = useTranslation();

  return (
    <div className="w-full">
      <h2 className="mb-3 px-1 text-lg font-bold text-stone-700">{t("scheduleHeading")}</h2>
      <div className="day-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4">
        {schedule.map((mission) => {
          const stat = statsByDay.get(mission.day);
          const isFocused = focusedDay === mission.day;
          const isToday = currentJourneyDay === mission.day;
          return (
            <div
              key={mission.day}
              id={`day-card-${mission.day}`}
              role="button"
              tabIndex={0}
              onClick={() => onFocusDay(mission.day)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onFocusDay(mission.day)}
              className={`group flex w-52 shrink-0 snap-start cursor-pointer flex-col rounded-2xl border bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isFocused ? "border-amber-400 ring-2 ring-amber-300" : "border-amber-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">{t("dayLabel", { day: mission.day })}</span>
                {isToday && (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[0.6rem] font-bold text-white">{t("today")}</span>
                )}
              </div>
              <p className="text-xs text-stone-400">{formatDayDate(mission.date, lang)}</p>
              <p className="mt-2 line-clamp-2 text-sm font-semibold text-stone-800">{getMissionTitle(mission, lang)}</p>
              <p className="text-xs text-stone-500">{getMissionSpeaker(mission, lang)}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
                  {t("sharedCount", { count: stat?.participantCount ?? 0 })}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDay(mission.day);
                  }}
                  className="text-xs font-semibold text-amber-600 underline-offset-2 hover:underline"
                >
                  {t("readAndShare")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
