/**
 * Pure geometry for the JUNO mascot.
 *
 * The body is re-generated every frame instead of being tweened between fixed
 * shapes: a handful of points in polar coordinates, wobbled by two sine waves
 * and joined by a closed Catmull-Rom spline. Because the two waves have
 * non-harmonic time frequencies the outline never settles into a loop the eye
 * can catch, and because their angular frequencies are whole numbers the curve
 * closes on itself without a crease.
 */

/** Points sampled around the outline. Ten is enough to stay smooth at 64px. */
export const BLOB_POINTS = 10;
export const BLOB_CX = 32;
export const BLOB_CY = 32;
/** Matches the silhouette of the original hand-drawn path. */
export const BLOB_RX = 27.5;
export const BLOB_RY = 28;

/**
 * Radius multiplier at `angle` (radians) and `t` (seconds), in
 * `[1 - amp, 1 + amp]`. Angular frequencies are integers so that
 * `blobRadius(0) === blobRadius(2π)`.
 */
export function blobRadius(angle: number, t: number, amp: number): number {
  const wobble =
    0.6 * Math.sin(3 * angle + 0.9 * t) + 0.4 * Math.sin(2 * angle - 1.37 * t);
  return 1 + amp * wobble;
}

/** Rounded to keep the `d` attribute short — sub-pixel precision is invisible. */
function r2(n: number): string {
  return n.toFixed(2);
}

/**
 * The body outline as an SVG path. `amp` is the deformation, expressed as a
 * fraction of the radius (0 = the resting silhouette).
 */
export function blobPath(t: number, amp: number): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < BLOB_POINTS; i++) {
    const angle = (i / BLOB_POINTS) * Math.PI * 2;
    const r = blobRadius(angle, t, amp);
    pts.push([BLOB_CX + Math.cos(angle) * BLOB_RX * r, BLOB_CY + Math.sin(angle) * BLOB_RY * r]);
  }

  const at = (i: number) => pts[(i + BLOB_POINTS) % BLOB_POINTS] as [number, number];
  let d = `M${r2(at(0)[0])} ${r2(at(0)[1])}`;
  for (let i = 0; i < BLOB_POINTS; i++) {
    const [px, py] = at(i - 1);
    const [x0, y0] = at(i);
    const [x1, y1] = at(i + 1);
    const [nx, ny] = at(i + 2);
    // Closed Catmull-Rom converted to a cubic Bézier segment.
    const c1x = x0 + (x1 - px) / 6;
    const c1y = y0 + (y1 - py) / 6;
    const c2x = x1 - (nx - x0) / 6;
    const c2y = y1 - (ny - y0) / 6;
    d += `C${r2(c1x)} ${r2(c1y)} ${r2(c2x)} ${r2(c2y)} ${r2(x1)} ${r2(y1)}`;
  }
  return `${d}Z`;
}

/**
 * How far the pupils travel for a pointer `dx`/`dy` away from the mascot's
 * centre, in viewBox units. The response eases out, so the gaze latches on
 * quickly when the pointer is close and then holds steady past `reach` instead
 * of drifting with every far-away movement.
 */
export function eyeOffset(
  dx: number,
  dy: number,
  max: number,
  reach: number,
): { x: number; y: number } {
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return { x: 0, y: 0 };
  const f = Math.min(1, dist / reach);
  const mag = (max * f * (2 - f)) / dist;
  return { x: dx * mag, y: dy * mag };
}
