import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UploadPdfComponent } from '../upload-pdf/upload-pdf.component';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  activeFeature: string = 'resume';

  // Uncomment if you want to show recent activities
  recentActivities = [
    {
      id: 1,
      icon: '✅',
      description: 'Resume analysis completed - Senior Engineer.pdf',
      time: '2 hours ago'
    },
    {
      id: 2,
      icon: '⏰',
      description: 'Code review scheduled for tomorrow',
      time: 'Yesterday'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Component initialization
  }

  setActiveFeature(feature: string): void {
    this.activeFeature = feature;
  }

  goToResume(): void {
    this.router.navigate(['/upload']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force redirect even if logout API fails
        this.router.navigate(['/login']);
      }
    });
  }
}
