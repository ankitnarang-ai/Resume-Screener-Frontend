import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { InterviewService } from '../../../services/interview/interview.service';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { getJD, setJD } from '../../../store/job-description';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

interface InterviewDetails {
  status: string;
  jobDescription: string;
}

interface Interview {
  _id: string;
  _hr: string;
  _candidate: string;
  interviewDetails: InterviewDetails;
}

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [AsyncPipe, MatPaginatorModule],
  templateUrl: './interviews.component.html',
  styleUrl: './interviews.component.scss'
})
export class InterviewsComponent implements OnInit {

  public interviews$: Observable<Interview[]> = of([]);
  userId: string = '';
  page: number = 1;
  limit: number = 10;
  isLoading: boolean = false;
  totalDocuments: number = 0;

  constructor(
    private authService: AuthService,
    private interviewService: InterviewService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    console.log("current usrd", currentUser);


    if (!currentUser || !currentUser._id) {
      console.error('User ID not found');
      return;
    }

    this.userId = currentUser._id;
    console.log("userid", this.userId);

    this.loadInterviews(this.userId);
  }

  private loadInterviews(userId: string): void {
    this.isLoading = true;

    this.interviews$ = this.interviewService.getInterviews(userId, true, this.page, this.limit).pipe(
      map((res) => {
        this.totalDocuments = res?.totalDocuments ?? 0;
        return res?.data ?? [];
      }),
      catchError(() => of([])),
      finalize(() => {
        this.isLoading = false;
      })
    )
  }

  goToInterview(interviewId: string, jobDescription: string): void {
    if (!interviewId || !jobDescription) {
      console.error('Interview ID or Job Description is missing');
      return;
    }

    // Save job description to shared signal
    setJD(jobDescription);

    // Navigate to AI interview screen
    this.router.navigate(['/interviews/ai-interview', interviewId]);
  }

  //Pagination
  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1; // mat-paginator is zero-based
    this.limit = event.pageSize;
    this.loadInterviews(this.userId);
  }


}
