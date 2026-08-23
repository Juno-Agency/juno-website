import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Static site generation:
 *   - public pages are prerendered to static HTML (SEO + fast first paint),
 *   - the back-office is auth-gated and browser-only → client-rendered.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'admin/stats', renderMode: RenderMode.Client },
  { path: 'admin/tickets', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
