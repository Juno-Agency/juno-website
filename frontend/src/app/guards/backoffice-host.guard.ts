import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const backofficeHostGuard: CanActivateFn = () => {
  // On the server (prerender), there is no host to inspect — let the page render.
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  const isBackofficeHost =
    host.startsWith('admin.') || host.startsWith('juno-admin');
  return isBackofficeHost ? inject(Router).createUrlTree(['/admin']) : true;
};
