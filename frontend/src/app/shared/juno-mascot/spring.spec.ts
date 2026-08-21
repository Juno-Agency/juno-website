import { describe, expect, it } from 'vitest';
import { SPRING_REST, Spring, springStep } from './spring';

/** Runs the spring for `seconds` and returns every value it passed through. */
function run(from: Spring, seconds: number, dt = 1 / 60): number[] {
  const values: number[] = [];
  let s = from;
  for (let t = 0; t < seconds; t += dt) {
    s = springStep(s, dt);
    values.push(s.value);
  }
  return values;
}

describe('springStep', () => {
  it('stays put when already at rest', () => {
    const s = springStep({ value: 0, velocity: 0 }, 1 / 60);
    expect(s.value).toBe(0);
    expect(s.velocity).toBe(0);
  });

  it('overshoots the resting point, so the squash bounces back', () => {
    const values = run({ value: -1, velocity: 0 }, 1);
    expect(Math.max(...values)).toBeGreaterThan(0.05);
  });

  it('loses energy on every swing', () => {
    const values = run({ value: -1, velocity: 0 }, 2);
    const early = Math.max(...values.slice(0, 20).map(Math.abs));
    const late = Math.max(...values.slice(-20).map(Math.abs));
    expect(late).toBeLessThan(early);
  });

  it('keeps ringing well past half a second', () => {
    // The bounce is meant to be enjoyed, not glimpsed.
    const values = run({ value: -1, velocity: 0 }, 0.6);
    expect(Math.abs(values.at(-1) as number)).toBeGreaterThan(0.05);
  });

  it('swings back and forth several times before settling', () => {
    // Count the perceptible peaks — squash, stretch, squash again — rather
    // than zero crossings, which say nothing about how far it swung.
    const values = run({ value: -1, velocity: 0 }, 1.5);
    const peaks: number[] = [];
    for (let i = 1; i < values.length - 1; i++) {
      const [prev, cur, next] = [values[i - 1], values[i], values[i + 1]] as number[];
      const isPeak = (cur - prev) * (next - cur) <= 0;
      if (isPeak && Math.abs(cur) > 0.03) peaks.push(cur);
    }
    expect(peaks.length).toBeGreaterThanOrEqual(3);
    // ...and they alternate sides, which is what makes it read as a bounce.
    expect(Math.sign(peaks[0] as number)).not.toBe(Math.sign(peaks[1] as number));
  });

  it('settles within two seconds', () => {
    const values = run({ value: -1, velocity: 0 }, 2);
    expect(Math.abs(values.at(-1) as number)).toBeLessThan(SPRING_REST);
  });

  it('stays stable on long frames instead of exploding', () => {
    // A 50ms frame is well past the step the spring is tuned for; it must
    // sub-step rather than diverge.
    const values = run({ value: -1, velocity: 0 }, 3, 0.05);
    for (const v of values) {
      expect(Number.isFinite(v)).toBe(true);
      expect(Math.abs(v)).toBeLessThanOrEqual(1);
    }
    expect(Math.abs(values.at(-1) as number)).toBeLessThan(SPRING_REST);
  });

  it('does not mutate the spring it is given', () => {
    const from: Spring = { value: -1, velocity: 0 };
    springStep(from, 1 / 60);
    expect(from).toEqual({ value: -1, velocity: 0 });
  });
});
