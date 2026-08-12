export interface FruitPosition {
  day: number;
  xPct: number;
  yPct: number;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Places `count` fruit inside the tree canopy.
 *
 * A phyllotaxis (sunflower-seed) spiral gives a good organic starting
 * spread, but on its own has no minimum-spacing guarantee — with enough
 * points (33 here), several end up close enough to visibly overlap once
 * rendered at real fruit size, especially on small mobile screens where
 * fruit take up a much larger fraction of the canopy's on-screen area.
 *
 * So the spiral is used only as a starting layout, then relaxed: points
 * closer than `minDist` (measured in ellipse-normalized space, since the
 * canopy is much wider than it is tall) repeatedly push each other apart,
 * re-clamping to stay inside the canopy ellipse after each pass. This
 * keeps the organic distribution while minimizing overlap far better than
 * the raw spiral alone.
 */
export function getFruitPositions(count: number): FruitPosition[] {
  const centerX = 50;
  const centerY = 40;
  const rx = 37;
  const ry = 32;

  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt((i + 0.5) / count);
    const theta = i * GOLDEN_ANGLE;
    points.push({
      x: centerX + r * rx * Math.cos(theta),
      y: centerY + r * ry * Math.sin(theta),
    });
  }

  // Normalized minimum distance (ellipse treated as a unit circle via the
  // rx/ry division below). Derived from circle-packing density for `count`
  // points in a unit disk — tuned down slightly since the spiral start is
  // already fairly even, so relaxation only needs to fix the worst spots.
  const minDist = Math.sqrt(Math.PI / (count * 1.05));
  const iterations = 150;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const nx1 = (points[i].x - centerX) / rx;
        const ny1 = (points[i].y - centerY) / ry;
        const nx2 = (points[j].x - centerX) / rx;
        const ny2 = (points[j].y - centerY) / ry;
        let dx = nx1 - nx2;
        let dy = ny1 - ny2;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1e-6) {
          dx = (Math.random() - 0.5) * 0.01;
          dy = (Math.random() - 0.5) * 0.01;
          dist = Math.sqrt(dx * dx + dy * dy);
        }
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const ux = (dx / dist) * push;
          const uy = (dy / dist) * push;
          points[i].x += ux * rx;
          points[i].y += uy * ry;
          points[j].x -= ux * rx;
          points[j].y -= uy * ry;
        }
      }
    }
    for (const p of points) {
      const nx = (p.x - centerX) / rx;
      const ny = (p.y - centerY) / ry;
      const r = Math.sqrt(nx * nx + ny * ny);
      if (r > 1) {
        p.x = centerX + (nx / r) * rx;
        p.y = centerY + (ny / r) * ry;
      }
    }
  }

  return points.map((p, i) => ({ day: i + 1, xPct: p.x, yPct: p.y }));
}
