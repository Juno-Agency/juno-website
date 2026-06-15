/**
 * Single source of truth for the user's motion preference.
 * Used to disable decorative animations and skip to final states.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
