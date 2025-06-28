import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      // Wait for auth service to initialize
      await this.authService.waitForInitialization();
      
      // Check authentication status
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (isAuthenticated) {
        console.log('User authenticated, allowing access');
        return true;
      } else {
        console.log('User not authenticated, redirecting to login');
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    } catch (error) {
      console.error('Auth guard error:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}