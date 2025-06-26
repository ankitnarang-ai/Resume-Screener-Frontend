
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login</h2>
        
        @if (errorMessage) {
          <div class="error-message">
            {{ errorMessage }}
          </div>
        }
        
        @if (successMessage) {
          <div class="success-message">
            {{ successMessage }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <div class="field-error">
                @if (loginForm.get('email')?.errors?.['required']) {
                  <span>Email is required</span>
                }
                @if (loginForm.get('email')?.errors?.['email']) {
                  <span>Please enter a valid email</span>
                }
              </div>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <div class="field-error">
                @if (loginForm.get('password')?.errors?.['required']) {
                  <span>Password is required</span>
                }
                @if (loginForm.get('password')?.errors?.['minlength']) {
                  <span>Password must be at least 6 characters</span>
                }
              </div>
            }
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="submit-btn"
          >
            @if (isLoading) {
              <span>Logging in...</span>
            } @else {
              <span>Login</span>
            }
          </button>
        </form>

        <div class="auth-links">
          <p>Don't have an account? <a (click)="goToSignup()">Sign up here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 20px;
    }

    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    input.error {
      border-color: #dc3545;
    }

    .field-error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #f5c6cb;
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      border: 1px solid #c3e6cb;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .submit-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .auth-links {
      text-align: center;
      margin-top: 1rem;
    }

    .auth-links a {
      color: #007bff;
      cursor: pointer;
      text-decoration: none;
    }

    .auth-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private getReturnUrl(): string {
    // Get return URL from query params or default to dashboard
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl') || '/dashboard';
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
          console.log(`Redirecting to: ${returnUrl}`);
          
          setTimeout(() => {
            this.router.navigate([returnUrl]);
          }, 1000);
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