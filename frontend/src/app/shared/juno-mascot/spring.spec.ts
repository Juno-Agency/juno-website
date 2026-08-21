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
    const values = run({ value: -1, velocity: 0 }, 1.2);
    const early = Math.max(...values.slice(0, 20).map(Math.abs));
    const late = Math.max(...values.slice(-20).map(Math.abs));
    expect(late).toBeLessThan(early);
  });

  it('settles within a second', () => {
    const values = run({ value: -1, velocity: 0 }, 1.2);
    expect(Math.abs(values.at(-1) as number)).toBeLessThan(SPRING_REST);
  });

  it('stays stable on long frames instead of exploding', () => {
    // A 50ms frame is well past the step the spring is tuned for; it must
    // sub-step rather than diverge.
    const values = run({ value: -1, velocity: 0 }, 2, 0.05);
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
