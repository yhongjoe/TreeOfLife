import { lerpColorStops } from "./color";
import { TOTAL_DAYS } from "./schedule";

/**
 * Dynamic daily background system.
 *
 * Rather than a raw hue sweep (which reads as random/ugly), the 33-day arc is
 * anchored at five hand-picked "keyframe" days that tell a warm visual story —
 * dawn -> golden morning -> full daylight -> soft dusk -> radiant finale — and
 * every day in between is linearly interpolated (in RGB space) between its two
 * nearest keyframes. This keeps every single day distinct while guaranteeing
 * the whole journey stays inside a warm, soft, cartoonish palette (spec 2.A).
 */
interface Keyframe {
  day: number;
  top: string;
  bottom: string;
  glow: string;
}

const KEYFRAMES: Keyframe[] = [
  { day: 1, top: "#FFE8D6", bottom: "#FFD6A5", glow: "#FFB988" }, // dawn blush
  { day: 9, top: "#FFF3D6", bottom: "#FFC98B", glow: "#FFCE7A" }, // golden morning
  { day: 17, top: "#FFF7E8", bottom: "#FFDDA1", glow: "#FFE2A0" }, // full warm daylight
  { day: 25, top: "#FFE3C2", bottom: "#F6C6D0", glow: "#F2B3C6" }, // soft dusk lavender-gold
  { day: 33, top: "#FFFDF2", bottom: "#FFE9B8", glow: "#FFF3C4" }, // radiant conference-day finale
];

export interface DayTheme {
  gradient: string;
  glow: string;
  day: number;
}

function clampDay(day: number): number {
  return Math.min(TOTAL_DAYS, Math.max(1, Math.round(day)));
}

export function getDayTheme(dayInput: number): DayTheme {
  const day = clampDay(dayInput);
  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (day >= KEYFRAMES[i].day && day <= KEYFRAMES[i + 1].day) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }
  const span = upper.day - lower.day || 1;
  const t = (day - lower.day) / span;
  const top = lerpColorStops([lower.top, upper.top], t);
  const bottom = lerpColorStops([lower.bottom, upper.bottom], t);
  const glow = lerpColorStops([lower.glow, upper.glow], t);
  return {
    day,
    glow,
    gradient: `linear-gradient(180deg, ${top} 0%, ${bottom} 55%, ${lerpColorStops([bottom, top], 0.35)} 100%)`,
  };
}

/**
 * Fruit brightness visual scale, 0-50 (spec 2.B).
 * 0 = dark silhouette, ~25 = warm visible apple, 50 = radiant glowing white-gold.
 */
export interface FruitVisual {
  fill: string;
  stroke: string;
  glowColor: string;
  glowOpacity: number;
  glowBlur: number;
  textColor: string;
}

const FRUIT_STOPS = {
  fill: ["#55555c", "#e2544b", "#fff4d6"],
  stroke: ["#2f2f34", "#b5352d", "#ffd76a"],
};

export function getFruitVisual(brightnessInput: number): FruitVisual {
  const brightness = Math.min(50, Math.max(0, brightnessInput));
  const t = brightness / 50;
  const fill = lerpColorStops(FRUIT_STOPS.fill, t);
  const stroke = lerpColorStops(FRUIT_STOPS.stroke, t);
  return {
    fill,
    stroke,
    glowColor: "#ffe9a8",
    glowOpacity: t * 0.95,
    glowBlur: 4 + t * 22,
    textColor: t > 0.65 ? "#5b3d0f" : "#fdf6ec",
  };
}

export function brightnessFromCount(participantCount: number, totalMembers: number): number {
  if (totalMembers <= 0) return 0;
  return Math.min(50, Math.max(0, Math.round((50 * participantCount) / totalMembers)));
}
