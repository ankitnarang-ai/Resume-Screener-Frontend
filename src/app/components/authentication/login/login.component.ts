import { Component, Inject, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonInputComponent } from '../../../shared/common-input/common-input.component';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CommonInputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @ViewChild('googleSignInContainer', { read: ViewContainerRef }) googleSignInContainer!: ViewContainerRef;
  
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isBrowser = false;
  googleSignInComponentRef: ComponentRef<any> | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  async ngAfterViewInit() {
    // Only load Google Sign-In component in browser
    if (this.isBrowser && this.googleSignInContainer) {
      try {
        const { GoogleSignInComponent } = await import('../google-sign-in/google-sign-in.component');
        this.googleSignInComponentRef = this.googleSignInContainer.createComponent(GoogleSignInComponent);
        this.googleSignInComponentRef.instance.loginError.subscribe((error: any) => {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
      } catch (error) {
        console.warn('Failed to load Google Sign-In component:', error);
      }
    }
  }

  ngOnDestroy() {
    if (this.googleSignInComponentRef) {
      this.googleSignInComponentRef.destroy();
    }
  }

  getFormControl(name: string): FormControl | null {
    return this.loginForm.get(name) as FormControl | null;
  }

  private getReturnUrl(): string {
    // Get return URL from query params or default to dashboard
    if (this.isBrowser) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('returnUrl') || '/dashboard';
    }
    return '/dashboard';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          
          // Check for returnUrl in query params
          const returnUrl = this.getReturnUrl();
          
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }
}