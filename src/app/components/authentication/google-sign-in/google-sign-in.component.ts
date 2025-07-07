import { Component, NgZone, OnInit, Inject, PLATFORM_ID, Input, Output, EventEmitter } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';

declare const google: any;

@Component({
  selector: 'app-google-sign-in',
  standalone: true,
  template: `
    <div class="google-signin-container">
      <div id="google-signin-button"></div>
    </div>
  `,
  styles: [`
    .google-signin-container {
      height: 50px;
      margin: 0 auto;
    }
  `]
})
export class GoogleSignInComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  @Input() mode: 'login' | 'signup' = 'login';
  @Output() signupSuccess = new EventEmitter<any>();
  @Output() signupError = new EventEmitter<any>();
  @Output() loginError = new EventEmitter<any>();


  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleScript();
    }
  }

  private loadGoogleScript(): void {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => this.initializeGoogleSignIn();
      document.head.appendChild(script);
    } else {
      this.initializeGoogleSignIn();
    }
  }

  private initializeGoogleSignIn(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleSignIn(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const button = document.getElementById('google-signin-button');
      if (button) {
        google.accounts.id.renderButton(
          button,
          {
            theme: 'outline',
            size: 'large',
            width: button.offsetWidth || 280,
            text: this.mode === 'signup' ? 'signup_with' : 'continue_with',
            shape: 'rectangle',
            type: 'standard',
            logo_alignment: 'left',
            locale: 'en'
          }
        );
      }
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
    }
  }

  private handleGoogleSignIn(response: any): void {
    this.ngZone.run(() => {
      if (response.credential) {
        this.isLoading = true;
        const idToken = response.credential;

        if (this.mode === 'signup') {
          this.handleGoogleSignup(idToken);
        } else {
          this.handleGoogleLogin(idToken);
        }
      } else {
        this.errorMessage = 'Google sign-in was cancelled or failed.';
        if (this.mode === 'signup') {
          this.signupError.emit(this.errorMessage);
        }
      }
    });
  }

  private handleGoogleSignup(idToken: string): void {
    this.authService.signupWithGoogle(idToken).subscribe({
      next: (authResponse) => {
        this.isLoading = false;
        this.successMessage = 'Google signup successful! Redirecting to role selection...';
        console.log("authresponse", authResponse);

        this.signupSuccess.emit(authResponse);
        setTimeout(() => {
          this.router.navigate(['/role-selection'], {
            queryParams: {
              id: authResponse.user.id
            }
          });
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Google signup failed. Please try again.';
        this.signupError.emit(this.errorMessage);
      }
    });
  }


  private handleGoogleLogin(idToken: string): void {
    this.authService.loginWithGoogle(idToken).subscribe({
      next: (authResponse) => {
        this.isLoading = false;
        this.successMessage = 'Google login successful! Redirecting...';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Google login failed. Please try again.';
        this.loginError.emit(this.errorMessage); // ✅ emit login error to parent
      }
    });
  }

}