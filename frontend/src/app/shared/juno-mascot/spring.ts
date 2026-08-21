/**
 * A damped spring, used for the mascot's reaction to a click: the body is
 * pushed to a squashed state and released, then overshoots and rings down.
 *
 * Kept as a plain function over plain values so the tuning is testable without
 * a DOM, and so the component holds no physics of its own.
 */

export interface Spring {
  /** 0 at rest, -1 fully squashed, positive while stretched. */
  readonly value: number;
  readonly velocity: number;
}

/** Stiffness — how hard it snaps back. Sets the tempo of the bounce. */
const STIFFNESS = 150;
/** Damping — low enough that the body swings several times before settling. */
const DAMPING = 7.5;
/** Below this the motion is invisible; tests use it as the settled threshold. */
export const SPRING_REST = 0.01;
/** Integration step. Long frames are split so the spring can't diverge. */
const MAX_STEP = 1 / 240;

/** Advances the spring by `dt` seconds, returning a new spring. */
export function springStep(spring: Spring, dt: number): Spring {
  let { value, velocity } = spring;
  const steps = Math.max(1, Math.ceil(dt / MAX_STEP));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    velocity += (-STIFFNESS * value - DAMPING * velocity) * h;
    value += velocity * h;
  }
  return { value, velocity };
}
