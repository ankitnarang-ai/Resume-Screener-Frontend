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
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    
    console.log('AuthGuard: Checking authentication...');
    
    return this.authService.checkAuthStatus().pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('AuthGuard: User authenticated, allowing access');
          return true;
        } else {
          console.warn('AuthGuard: User not authenticated. Redirecting to login.');
          return this.router.parseUrl('/login');
        }
      }),
      catchError(error => {
        console.error('AuthGuard: Error during authentication check:', error);
        return of(this.router.parseUrl('/login'));
      })
    );
  }
}