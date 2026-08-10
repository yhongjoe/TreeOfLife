export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linearly interpolates between two hex colors. t is clamped to [0, 1]. */
export function lerpColor(hexA: string, hexB: string, t: number): string {
  const tt = Math.min(1, Math.max(0, t));
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(lerp(r1, r2, tt), lerp(g1, g2, tt), lerp(b1, b2, tt));
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha)).toFixed(3)})`;
}

/** Interpolates across an ordered list of hex color stops, evenly spaced across [0, 1]. */
export function lerpColorStops(stops: string[], t: number): string {
  const tt = Math.min(1, Math.max(0, t));
  if (stops.length === 1) return stops[0];
  const segment = 1 / (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(tt / segment));
  const localT = (tt - index * segment) / segment;
  return lerpColor(stops[index], stops[index + 1], localT);
}
