import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const backofficeHostGuard: CanActivateFn = () => {
  const host = window.location.hostname;
  const isBackofficeHost =
    host.startsWith('admin.') || host.startsWith('juno-admin');
  return isBackofficeHost ? inject(Router).createUrlTree(['/admin']) : true;
};
