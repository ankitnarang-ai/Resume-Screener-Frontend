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
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> { // Changed return type to Observable<boolean | UrlTree>
    // Call the backend authentication status check
    return this.authService.checkAuthStatus().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          // If the backend confirms authentication, allow access
          return true;
        } else {
          // If the backend indicates not authenticated, redirect to login
          console.warn('AuthGuard: User not authenticated. Redirecting to login.');
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}