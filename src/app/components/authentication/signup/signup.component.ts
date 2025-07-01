import { Component, Inject, ViewChild, ViewContainerRef, ComponentRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

import { AuthService } from '../../../services/auth/auth.service';
import { CommonInputComponent } from '../../../shared/common-input/common-input.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommonInputComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  @ViewChild('googleSignInContainer', { read: ViewContainerRef }) googleSignInContainer!: ViewContainerRef;
  
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isBrowser = false;
  googleSignInComponentRef: ComponentRef<any> | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Removed role field from form
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // In the ngAfterViewInit method of SignupComponent
async ngAfterViewInit() {
  // Only load Google Sign-In component in browser
  if (this.isBrowser && this.googleSignInContainer) {
    try {
      const { GoogleSignInComponent } = await import('../google-sign-in/google-sign-in.component');
      this.googleSignInComponentRef = this.googleSignInContainer.createComponent(GoogleSignInComponent);
      this.googleSignInComponentRef.instance.mode = 'signup';
      this.googleSignInComponentRef.instance.signupSuccess.subscribe((response: any) => {
        // Handle successful signup (if needed)
      });
      this.googleSignInComponentRef.instance.signupError.subscribe((error: any) => {
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

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, ...signupData } = this.signupForm.value;

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          console.log("response", response);
          
          // Only show snackbar in browser
          if (this.isBrowser) {
            this.snackBar.open('Account created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          }
          
          // Navigate to role selection page instead of login
          setTimeout(() => {
            this.router.navigate(['/role-selection'], { 
              queryParams: { id: response.user._id } // Pass user ID if available
            });
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
          
          // Only show snackbar in browser
          if (this.isBrowser) {
            this.snackBar.open(this.errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signupForm.controls).forEach(key => {
        this.signupForm.get(key)?.markAsTouched();
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Helper method to get form control for error handling
  getFormControl(controlName: string): FormControl | null {
    return this.signupForm.get(controlName) as FormControl;
  }

  // Custom error message for confirm password
  getConfirmPasswordError(): string {
    const control = this.getFormControl('confirmPassword');
    if (control?.errors?.['required']) {
      return 'Confirm password is required';
    }
    if (control?.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }
}