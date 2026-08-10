"use client";

import { formatDayDate } from "@/lib/schedule";
import type { MissionDay, Testimony } from "@/lib/types";

interface FruitTooltipProps {
  mission: MissionDay;
  xPct: number;
  yPct: number;
  participantCount: number;
  previewTestimonies: Testimony[];
}

export default function FruitTooltip({ mission, xPct, yPct, participantCount, previewTestimonies }: FruitTooltipProps) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30 w-56 -translate-x-1/2 -translate-y-[calc(100%+18px)] rounded-2xl border border-amber-200/70 bg-white/95 p-3 text-left shadow-xl backdrop-blur-sm animate-tooltip-in"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-amber-700">Day {mission.day} · {formatDayDate(mission.date)}</span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-800">
          {participantCount} shared
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-stone-800 leading-snug">{mission.title}</p>
      <p className="text-xs text-stone-500">{mission.speaker}</p>
      <div className="mt-2 space-y-1.5 border-t border-amber-100 pt-2">
        {previewTestimonies.length === 0 && (
          <p className="text-xs italic text-stone-400">Be the first to share a testimony today.</p>
        )}
        {previewTestimonies.slice(0, 2).map((t) => (
          <p key={t.id} className="line-clamp-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-700">{t.authorName}:</span> {t.message}
          </p>
        ))}
      </div>
      <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-amber-200/70 bg-white/95" />
    </div>
  );
}
