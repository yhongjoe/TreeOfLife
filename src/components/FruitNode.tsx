"use client";

import { getFruitVisual } from "@/lib/background";
import { hexToRgba } from "@/lib/color";

interface FruitNodeProps {
  day: number;
  xPct: number;
  yPct: number;
  brightness: number;
  participantCount: number;
  isFocused: boolean;
  onOpen: (day: number) => void;
  onHoverStart: (day: number) => void;
  onHoverEnd: () => void;
}

export default function FruitNode({
  day,
  xPct,
  yPct,
  brightness,
  participantCount,
  isFocused,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: FruitNodeProps) {
  const visual = getFruitVisual(brightness);

  return (
    <button
      type="button"
      data-day={day}
      aria-label={`Day ${day} — ${participantCount} testimonies shared. Open to read and share.`}
      onClick={() => onOpen(day)}
      onMouseEnter={() => onHoverStart(day)}
      onMouseLeave={onHoverEnd}
      onFocus={() => onHoverStart(day)}
      onBlur={onHoverEnd}
      className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-manipulation select-none"
      style={{ left: `${xPct}%`, top: `${yPct}%` }}
    >
      <span
        className={`relative flex h-[6.2vw] w-[6.2vw] min-h-5 min-w-5 max-h-14 max-w-14 items-center justify-center transition-transform duration-300 ease-out sm:min-h-9 sm:min-w-9 group-hover:scale-115 group-active:scale-95 ${
          isFocused ? "animate-fruit-pulse scale-125" : ""
        }`}
        style={{
          filter: `drop-shadow(0 0 ${visual.glowBlur}px ${hexToRgba(visual.glowColor, visual.glowOpacity)})`,
        }}
      >
        <svg viewBox="0 0 40 40" className="h-full w-full overflow-visible">
          <line x1="20" y1="12" x2="20" y2="5" stroke="#7a5230" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="25" cy="7" rx="4.5" ry="2.6" fill="#7fbf6a" opacity="0.85" transform="rotate(-25 25 7)" />
          <path
            d="M20 12 C16 6 8 8 8 16 C8 26 14 34 20 34 C26 34 32 26 32 16 C32 8 24 6 20 12 Z"
            fill={visual.fill}
            stroke={visual.stroke}
            strokeWidth="1.6"
          />
          <ellipse cx="15" cy="16" rx="3" ry="4.5" fill="#ffffff" opacity={0.16 + (brightness / 50) * 0.22} />
          <text
            x="20"
            y="24"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={visual.textColor}
            className="select-none"
          >
            {day}
          </text>
        </svg>
        <span className="absolute -right-1 -top-0.5 min-w-[0.9rem] rounded-full border border-white/70 bg-amber-500 px-0.5 text-center text-[0.5rem] font-bold leading-[0.85rem] text-white shadow-sm sm:-right-1.5 sm:-top-1 sm:min-w-[1.15rem] sm:px-1 sm:text-[0.6rem] sm:leading-[1.1rem]">
          {participantCount}
        </span>
      </span>
    </button>
  );
}
