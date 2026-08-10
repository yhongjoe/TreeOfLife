export interface FruitPosition {
  day: number;
  xPct: number;
  yPct: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Places `count` fruit inside the tree canopy using a phyllotaxis (sunflower
 * seed) distribution. This gives an organic, evenly-spread cluster without
 * hand-authoring 33 coordinates, and stays deterministic across renders.
 * Coordinates are percentages of the tree illustration's viewBox, centered
 * on the canopy (roughly the top 60% of the artwork — see Tree.tsx).
 */
export function getFruitPositions(count: number): FruitPosition[] {
  const positions: FruitPosition[] = [];
  const centerX = 50;
  const centerY = 36;
  const rx = 34;
  const ry = 24;

  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    const theta = i * GOLDEN_ANGLE;
    const xPct = centerX + r * rx * Math.cos(theta);
    const yPct = centerY + r * ry * Math.sin(theta);
    positions.push({ day: i + 1, xPct, yPct });
  }
  return positions;
}
