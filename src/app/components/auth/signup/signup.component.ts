// src/app/components/auth/signup/signup.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.error = '';

    // Basic validation
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      this.isLoading = false;
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      this.isLoading = false;
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      this.isLoading = false;
      return;
    }

  }
}