import { CanActivateFn } from '@angular/router';

import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const role = authService?.currentUserValue?.role;
  if(role === 'hr') {
    return true;
  }
  return of(router.parseUrl('/interviews'));
};
