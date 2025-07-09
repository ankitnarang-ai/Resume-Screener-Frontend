import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth/auth.service';

interface RoleOption {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="role-selection-wrapper">
      <div class="role-selection-container">
        <mat-card class="role-selection-card">
          <mat-card-header>
            <mat-card-title class="title">Choose Your Role</mat-card-title>
            <mat-card-subtitle class="subtitle">
              Select how you'd like to use our platform
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="roles-grid">
              <div 
                *ngFor="let role of roleOptions" 
                class="role-option"
                [class.selected]="selectedRole === role.value"
                (click)="selectRole(role.value)"
              >
                <div class="role-icon" [style.background-color]="role.color">
                  <mat-icon>{{ role.icon }}</mat-icon>
                </div>
                <h3>{{ role.label }}</h3>
                <p>{{ role.description }}</p>
                <div class="selection-indicator" *ngIf="selectedRole === role.value">
                  <mat-icon>check_circle</mat-icon>
                </div>
              </div>
            </div>

            <div class="actions">
              <button 
                mat-raised-button 
                color="primary" 
                [disabled]="!selectedRole || isLoading"
                (click)="confirmRoleSelection()"
                class="confirm-btn"
              >
                @if (isLoading) {
                <div class="btn-loading">
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Setting up your account...</span>
                </div>
                } @else {
                <span>Continue</span>
                }
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .role-selection-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
    }

    .role-selection-container {
      width: 100%;
      max-width: 800px;
    }

    .role-selection-card {
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .title {
      font-size: 2rem;
      font-weight: 600;
      text-align: center;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .role-option {
      position: relative;
      padding: 2rem;
      border: 2px solid #e0e0e0;
      border-radius: 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fff;

      &:hover {
        border-color: #007bff;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 123, 255, 0.2);
      }

      &.selected {
        border-color: #007bff;
        background: #f8f9ff;
        box-shadow: 0 5px 15px rgba(0, 123, 255, 0.2);
      }
    }

    .role-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;

      mat-icon {
        font-size: 2.5rem;
        width: 2.5rem;
        height: 2.5rem;
        color: white;
      }
    }

    .role-option h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .role-option p {
      color: #666;
      line-height: 1.5;
      margin-bottom: 0;
    }

    .selection-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      color: #007bff;

      mat-icon {
        font-size: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    .confirm-btn {
      width: 100%;
      max-width: 300px;
      height: 48px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .skip-btn {
      color: #666;
      text-decoration: underline;

      &:hover {
        color: #333;
      }
    }

    .btn-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;

      span {
        font-size: 14px;
      }
    }

    @media (max-width: 768px) {
      .role-selection-wrapper {
        padding: 1rem;
      }

      .role-selection-card {
        padding: 1.5rem;
      }

      .roles-grid {
        grid-template-columns: 1fr;
      }

      .title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RoleSelectionComponent implements OnInit {
  selectedRole: string = 'hr';
  isLoading = false;
  userId: string = '';

  roleOptions: RoleOption[] = [
    {
      value: 'candidate',
      label: 'Job Seeker',
      description: 'Looking for new opportunities and career growth',
      icon: 'person_search',
      color: '#4CAF50'
    },
    {
      value: 'hr',
      label: 'Human Resource',
      description: 'Recruiting talent and managing hiring processes',
      icon: 'business_center',
      color: '#2196F3'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Get user ID from query params if available
    this.route.queryParams.subscribe(params => {
      this.userId = params['id'] || '';
    });
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

  confirmRoleSelection() {
    if (!this.selectedRole) return;

    this.isLoading = true;
    
    // Call API to update user role
    this.authService.updateUserRole(this.userId, this.selectedRole).subscribe({
      
      next: (response) => {
        
        this.isLoading = false;
        
        this.snackBar.open('Role selected successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to appropriate dashboard based on role
        this.navigateToDashboard();
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to set role. Please try again.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private navigateToDashboard() {
    // Navigate based on selected role
    if (this.selectedRole === 'candidate') {
      this.router.navigate(['/candidate-dashboard']);
    } else if (this.selectedRole === 'hr') {
      this.router.navigate(['/hr-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}