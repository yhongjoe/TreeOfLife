"use client";

import { useEffect, useRef, useState } from "react";
import { getDayTheme } from "@/lib/background";

interface BackgroundLayerProps {
  day: number;
  children: React.ReactNode;
}

/**
 * Renders the day-by-day ambient background (spec 2.A) as two stacked,
 * always-mounted layers that crossfade opacity whenever `day` changes.
 * Only `opacity` is animated (never `background-image` directly), which is
 * what makes the transition smooth across browsers.
 */
export default function BackgroundLayer({ day, children }: BackgroundLayerProps) {
  const initial = getDayTheme(day).gradient;
  const [layers, setLayers] = useState<[string, string]>([initial, initial]);
  const [activeIndex, setActiveIndex] = useState<0 | 1>(0);
  const lastDay = useRef(day);

  useEffect(() => {
    if (day === lastDay.current) return;
    lastDay.current = day;
    const nextGradient = getDayTheme(day).gradient;
    setLayers((prev) => {
      const next: [string, string] = [...prev];
      next[activeIndex === 0 ? 1 : 0] = nextGradient;
      return next;
    });
    setActiveIndex((i) => (i === 0 ? 1 : 0));
  }, [day, activeIndex]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ backgroundImage: layers[0], opacity: activeIndex === 0 ? 1 : 0 }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ backgroundImage: layers[1], opacity: activeIndex === 1 ? 1 : 0 }}
        />
      </div>
      {children}
    </div>
  );
}
