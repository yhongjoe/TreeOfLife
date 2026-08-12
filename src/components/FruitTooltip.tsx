"use client";

import { formatDayDate, getMissionTitle, getMissionSpeaker } from "@/lib/schedule";
import type { MissionDay, Testimony } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/translations";

interface FruitTooltipProps {
  mission: MissionDay;
  xPct: number;
  yPct: number;
  participantCount: number;
  previewTestimonies: Testimony[];
}

export default function FruitTooltip({ mission, xPct, yPct, participantCount, previewTestimonies }: FruitTooltipProps) {
  const { t, lang } = useTranslation();

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30 w-56 -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-2xl border border-amber-200/70 bg-white/95 p-3 text-left shadow-xl backdrop-blur-sm animate-tooltip-in"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-700">
          {t("dayLabel", { day: mission.day })} · {formatDayDate(mission.date, lang)}
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
          {t("sharedCount", { count: participantCount })}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-stone-800 leading-snug">{getMissionTitle(mission, lang)}</p>
      <p className="text-xs text-stone-500">{getMissionSpeaker(mission, lang)}</p>
      <div className="mt-2 space-y-1.5 border-t border-amber-100 pt-2">
        {previewTestimonies.length === 0 && <p className="text-xs italic text-stone-400">{t("beFirstToShare")}</p>}
        {previewTestimonies.slice(0, 2).map((testimony) => (
          <p key={testimony.id} className="line-clamp-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-700">{testimony.authorName}:</span> {testimony.message}
          </p>
        ))}
      </div>
      <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-amber-200/70 bg-white/95" />
    </div>
  );
}
