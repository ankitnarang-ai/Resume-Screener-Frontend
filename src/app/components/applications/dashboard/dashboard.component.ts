import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit {
  // Analytics data - these would typically come from a service
  totalResumesAnalyzed: number = 127;
  matchedCandidates: number = 89;
  interviewInvitesSent: number = 45;
  interviewsCompleted: number = 23;

  // Recent activities with more comprehensive data
  recentActivities = [
    {
      id: 1,
      icon: '📄',
      description: 'Resume batch analysis completed - Software Engineer positions',
      time: '2 hours ago',
      status: 'completed',
      statusText: 'Completed'
    },
    {
      id: 2,
      icon: '🎯',
      description: '15 candidates matched for Marketing Manager role',
      time: '4 hours ago',
      status: 'completed',
      statusText: 'Matched'
    },
    {
      id: 3,
      icon: '📧',
      description: 'Interview invitations sent to 8 candidates',
      time: '1 day ago',
      status: 'in-progress',
      statusText: 'Sent'
    },
    {
      id: 4,
      icon: '🎥',
      description: 'AI interview completed - John Doe (Frontend Developer)',
      time: '2 days ago',
      status: 'completed',
      statusText: 'Completed'
    },
    {
      id: 5,
      icon: '⏰',
      description: 'Pending AI interviews - 12 candidates scheduled',
      time: '2 days ago',
      status: 'pending',
      statusText: 'Pending'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize component and load dashboard data
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // In a real application, you would fetch this data from your backend service
    // For now, we're using mock data
    
    // Example of how you might fetch real data:
    // this.dashboardService.getAnalytics().subscribe(data => {
    //   this.totalResumesAnalyzed = data.totalResumes;
    //   this.matchedCandidates = data.matchedCandidates;
    //   this.interviewInvitesSent = data.interviewInvites;
    //   this.interviewsCompleted = data.completedInterviews;
    // });
  }

  // Navigation methods
  goToResume(): void {
    this.router.navigate(['/upload']);
  }

  goToJobPostings(): void {
    // Navigate to job postings management page
    this.router.navigate(['/job-postings']);
  }

  goToCandidates(): void {
    // Navigate to candidate management page
    this.router.navigate(['/candidates']);
  }

  goToInterviews(): void {
    // Navigate to interview management page
    this.router.navigate(['/interviews']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper methods for workflow status
  getWorkflowProgress(): number {
    let completedSteps = 0;
    if (this.totalResumesAnalyzed > 0) completedSteps++;
    if (this.matchedCandidates > 0) completedSteps++;
    if (this.interviewInvitesSent > 0) completedSteps++;
    if (this.interviewsCompleted > 0) completedSteps++;
    
    return (completedSteps / 4) * 100;
  }

  getActiveWorkflowStep(): string {
    if (this.interviewsCompleted > 0) return 'completed';
    if (this.interviewInvitesSent > 0) return 'interviews';
    if (this.matchedCandidates > 0) return 'invitations';
    if (this.totalResumesAnalyzed > 0) return 'matching';
    return 'collection';
  }

  // Utility methods for formatting
  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  getMatchingRate(): number {
    if (this.totalResumesAnalyzed === 0) return 0;
    return Math.round((this.matchedCandidates / this.totalResumesAnalyzed) * 100);
  }

  getInterviewConversionRate(): number {
    if (this.interviewInvitesSent === 0) return 0;
    return Math.round((this.interviewsCompleted / this.interviewInvitesSent) * 100);
  }

  // Method to refresh dashboard data
  refreshData(): void {
    this.loadDashboardData();
  }
}