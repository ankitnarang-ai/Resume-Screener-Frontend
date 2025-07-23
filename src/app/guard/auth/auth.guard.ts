import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const token = route.queryParamMap.get('token');
    const isAiInterviewRoute = state.url.startsWith('/interviews/ai-interview');

    return this.authService.checkAuthStatus().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }

        // If unauthenticated but accessing ai-interview with a token, allow
        if (isAiInterviewRoute && token) {
          return true; // ✅ Allow access without storing token
        }

        // Otherwise redirect to login
        return this.router.parseUrl('/login');
      }),
      catchError(() => of(this.router.parseUrl('/login')))
    );
  }
}