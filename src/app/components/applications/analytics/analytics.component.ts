import { CommonModule } from "@angular/common"
import { Component, OnInit, ChangeDetectorRef, NgZone } from "@angular/core"
import { MatIconModule } from "@angular/material/icon"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../services/auth/auth.service"
import { DashboardService } from "../../../services/dashboard/dashboard.service"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.scss"],
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule],
})
export class AnalyticsComponent implements OnInit {
  // Analytics data
  totalResumesAnalyzed = 0
  matchedCandidates = 0
  interviewInvitesSent = 0
  interviewRejections = 0
  aiInterviewsCompleted = 0
  humanInterviewsCompleted = 0
  isLoading = true

  // Toast notifications
  showSuccessToast = false
  showErrorToast = false
  successMessage = ''
  errorMessage = ''

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadAnalyticsData()
  }

  loadAnalyticsData(): void {
    this.authService.checkAuthStatus().subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.loadAnalytics()
        } else {
          this.router.navigate(["/login"])
        }
      },
      error: (error) => {
        console.error("Error checking authentication status:", error)
        this.router.navigate(["/login"])
      },
    })
  }

  private loadAnalytics(): void {
    this.isLoading = true

    this.dashboardService.getAnalytics().subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          const data = response.data || response

          // Map API response properties
          this.totalResumesAnalyzed = data.resumeCount || 0
          this.matchedCandidates = data.candidateMatched || 0
          this.interviewInvitesSent = data.interviewInvitation || 0
          this.interviewRejections = data.interviewRejection || 0
          this.aiInterviewsCompleted = data.aiInterviewCompleted || 0
          this.humanInterviewsCompleted = data.humanInterviewCompleted || 0

          this.isLoading = false
          this.cdr.detectChanges()
        })
      },
      error: (error) => {
        this.ngZone.run(() => {
          console.error("Error loading analytics data:", error)
          this.setDefaultValues()
          this.isLoading = false
          this.showError('Failed to load analytics data')
          this.cdr.detectChanges()
        })
      },
    })
  }

  private setDefaultValues(): void {
    this.totalResumesAnalyzed = 0
    this.matchedCandidates = 0
    this.interviewInvitesSent = 0
    this.interviewRejections = 0
    this.aiInterviewsCompleted = 0
    this.humanInterviewsCompleted = 0
  }

  // Navigation methods
  goToResume(): void {
    this.router.navigate(["/upload"])
  }

  goToJobPostings(): void {
    this.router.navigate(["/job-postings"])
  }

  goToCandidates(): void {
    this.router.navigate(["/candidates"])
  }

  goToInterviews(): void {
    this.router.navigate(["/interviews"])
  }

  goToAIInterviews(): void {
    this.router.navigate(["/interviews/ai"])
  }

  goToHumanInterviews(): void {
    this.router.navigate(["/interviews/human"])
  }

  goToRejections(): void {
    this.router.navigate(["/rejections"])
  }

  goToInterviewResults(): void {
    this.router.navigate(["/interviews/results"])
  }

  // Helper methods
  getTotalInterviews(): number {
    return this.aiInterviewsCompleted + this.humanInterviewsCompleted
  }

  getMatchingRate(): number {
    if (this.totalResumesAnalyzed === 0) return 0
    return Math.round((this.matchedCandidates / this.totalResumesAnalyzed) * 100)
  }

  getInvitationRate(): number {
    if (this.matchedCandidates === 0) return 0
    return Math.round((this.interviewInvitesSent / this.matchedCandidates) * 100)
  }

  getRejectionRate(): number {
    if (this.interviewInvitesSent === 0) return 0
    return Math.round((this.interviewRejections / this.interviewInvitesSent) * 100)
  }

  getInterviewConversionRate(): number {
    if (this.interviewInvitesSent === 0) return 0
    const totalInterviews = this.getTotalInterviews()
    return Math.round((totalInterviews / this.interviewInvitesSent) * 100)
  }

  // Export functionality
  exportReport(): void {
    this.showSuccess('Report exported successfully!')
    // Implement actual export functionality
  }

  refreshData(): void {
    this.loadAnalyticsData()
  }

  // Toast notification methods
  showSuccess(message: string): void {
    this.successMessage = message
    this.showSuccessToast = true
    setTimeout(() => {
      this.hideSuccessToast()
    }, 3000)
  }

  showError(message: string): void {
    this.errorMessage = message
    this.showErrorToast = true
    setTimeout(() => {
      this.hideErrorToast()
    }, 5000)
  }

  hideSuccessToast(): void {
    this.showSuccessToast = false
    this.successMessage = ''
  }

  hideErrorToast(): void {
    this.showErrorToast = false
    this.errorMessage = ''
  }
}