// signup.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonInputComponent } from '../../../shared/common-input/common-input.component';
import { CommonSelectComponent, SelectOption } from '../../../shared/common-select/common-select.component';
import { FormControl } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { GoogleSignInComponent } from '../google-sign-in/google-sign-in.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    CommonInputComponent,
    CommonSelectComponent,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    GoogleSignInComponent
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  roles: SelectOption[] = [
    { value: 'candidate', label: 'Candidate' },
    { value: 'hr', label: 'Human Resource' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Signup failed. Please try again.';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
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