import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service'; // Adjust path if necessary
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Ensures a single instance available application-wide
})
export class GuestGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Determines if a route can be activated.
   * Prevents authenticated users from accessing guest-only routes (e.g., login, signup).
   *
   * @param route The activated route snapshot.
   * @param state The router state snapshot.
   * @returns An Observable that emits true to allow navigation, or a UrlTree to redirect.
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // Call the backend authentication status check
    return this.authService.checkAuthStatus().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // If the user IS authenticated, redirect them away from guest routes
          // For example, redirect to the dashboard or a default authenticated page.
          console.warn('GuestGuard: User is already authenticated. Redirecting to /dashboard.');
          return this.router.parseUrl('/dashboard');
        } else {
          // If the user is NOT authenticated, allow access to the guest route (login/signup)
          return true;
        }
      })
    );
  }
}