"use client";

import { useMemo, useState } from "react";
import FruitNode from "./FruitNode";
import FruitTooltip from "./FruitTooltip";
import { getFruitPositions } from "@/lib/fruitLayout";
import { getMission, TOTAL_DAYS } from "@/lib/schedule";
import { useTestimonyPreview } from "@/lib/dataService";
import type { DayStats } from "@/lib/types";

interface TreeProps {
  dayStats: DayStats[];
  focusedDay: number | null;
  onOpenDay: (day: number) => void;
}

function TreeIllustration() {
  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8a5a3b" />
          <stop offset="55%" stopColor="#a3714a" />
          <stop offset="100%" stopColor="#6b4226" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="30%" cy="15%" r="60%">
          <stop offset="0%" stopColor="#fff6d8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="500" cy="656" rx="230" ry="26" fill="#5b3d22" opacity="0.18" />

      {/* branch stubs, drawn behind canopy so only tips peek out */}
      <g stroke="#7a5230" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M500 470 C 430 420, 330 380, 230 340" strokeWidth="16" />
        <path d="M500 460 C 580 400, 690 360, 790 320" strokeWidth="16" />
        <path d="M500 450 C 470 380, 420 300, 380 220" strokeWidth="14" />
        <path d="M500 450 C 540 380, 600 300, 660 230" strokeWidth="14" />
      </g>

      {/* trunk */}
      <path
        d="M455 660 C 445 560, 448 500, 465 440 L 535 440 C 552 500, 555 560, 545 660 Z"
        fill="url(#trunkGrad)"
      />
      <path d="M455 660 C 430 645, 420 630, 430 610 L 470 640 Z" fill="#6b4226" />
      <path d="M545 660 C 570 645, 580 630, 570 610 L 530 640 Z" fill="#6b4226" />

      {/* canopy — layered soft blobs for a fluffy cartoon silhouette */}
      <g>
        <ellipse cx="500" cy="290" rx="330" ry="215" fill="#4f8a52" />
        <ellipse cx="300" cy="330" rx="180" ry="150" fill="#5a9756" />
        <ellipse cx="710" cy="330" rx="185" ry="155" fill="#5a9756" />
        <ellipse cx="500" cy="180" rx="220" ry="150" fill="#6fae5e" />
        <ellipse cx="350" cy="220" rx="140" ry="110" fill="#7bbb66" />
        <ellipse cx="650" cy="220" rx="145" ry="112" fill="#7bbb66" />
        <ellipse cx="500" cy="150" rx="150" ry="95" fill="#8fd17a" opacity="0.9" />
        <ellipse cx="380" cy="480" rx="150" ry="90" fill="#5a9756" opacity="0.95" />
        <ellipse cx="620" cy="480" rx="150" ry="90" fill="#5a9756" opacity="0.95" />
      </g>
      <ellipse cx="500" cy="290" rx="330" ry="215" fill="url(#sunGlow)" />

      {/* scattered leaf texture */}
      <g fill="#3f7a45" opacity="0.35">
        <ellipse cx="230" cy="260" rx="10" ry="5" transform="rotate(20 230 260)" />
        <ellipse cx="760" cy="270" rx="10" ry="5" transform="rotate(-15 760 270)" />
        <ellipse cx="420" cy="140" rx="9" ry="4.5" transform="rotate(35 420 140)" />
        <ellipse cx="600" cy="150" rx="9" ry="4.5" transform="rotate(-30 600 150)" />
        <ellipse cx="330" cy="460" rx="9" ry="4.5" transform="rotate(10 330 460)" />
        <ellipse cx="670" cy="460" rx="9" ry="4.5" transform="rotate(-10 670 460)" />
      </g>
    </svg>
  );
}

export default function Tree({ dayStats, focusedDay, onOpenDay }: TreeProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const positions = useMemo(() => getFruitPositions(TOTAL_DAYS), []);
  const statsByDay = useMemo(() => new Map(dayStats.map((s) => [s.day, s])), [dayStats]);
  const hoveredTestimonies = useTestimonyPreview(hoveredDay);

  const hoveredPos = hoveredDay ? positions.find((p) => p.day === hoveredDay) : undefined;
  const hoveredMission = hoveredDay ? getMission(hoveredDay) : undefined;

  return (
    <div className="relative mx-auto aspect-[10/7] w-full max-w-4xl select-none">
      <TreeIllustration />
      <div className="absolute inset-0">
        {positions.map((pos) => {
          const stat = statsByDay.get(pos.day);
          return (
            <FruitNode
              key={pos.day}
              day={pos.day}
              xPct={pos.xPct}
              yPct={pos.yPct}
              brightness={stat?.brightness ?? 0}
              participantCount={stat?.participantCount ?? 0}
              isFocused={focusedDay === pos.day}
              onOpen={onOpenDay}
              onHoverStart={setHoveredDay}
              onHoverEnd={() => setHoveredDay(null)}
            />
          );
        })}
      </div>
      {hoveredPos && hoveredMission && (
        <FruitTooltip
          mission={hoveredMission}
          xPct={hoveredPos.xPct}
          yPct={hoveredPos.yPct}
          participantCount={statsByDay.get(hoveredMission.day)?.participantCount ?? 0}
          previewTestimonies={hoveredTestimonies}
        />
      )}
    </div>
  );
}
