import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  CanActivateChild 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuthentication(state.url);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAuthentication(state.url);
  }

  private checkAuthentication(url: string): Observable<boolean> {
    console.log('AuthGuard: Checking authentication for:', url);
    
    // First check if user appears to be logged in locally
    if (this.authService.getCurrentAuthState()) {
      console.log('AuthGuard: User appears to be logged in locally');
      return of(true);
    }

    // If no local state, try to verify with server
    console.log('AuthGuard: Verifying with server...');
    
    return this.authService.verifyToken().pipe(
      map((isValid: boolean) => {
        console.log('AuthGuard: Server verification result:', isValid);
        
        if (isValid) {
          return true;
        } else {
          console.log('AuthGuard: Authentication failed, redirecting to login');
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
