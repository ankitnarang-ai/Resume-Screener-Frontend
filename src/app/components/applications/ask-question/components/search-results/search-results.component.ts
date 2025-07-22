// search-results.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SearchResultsService } from '../../../../../services/search-result/search-results.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../../environment';
import { Subscription } from 'rxjs';
import { getJD } from '../../../../../store/job-description';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchResults: any[] = [];
  lastSearchStats: string = '';
  isLoading: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private http: HttpClient,
    private searchResultsService: SearchResultsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    // Subscribe to results
    this.subscriptions.add(
      this.searchResultsService.results$.subscribe(results => {

        this.searchResults = results;

        // Force change detection
        this.cdr.detectChanges();

      })
    );

    // Subscribe to stats
    this.subscriptions.add(
      this.searchResultsService.stats$.subscribe(stats => {
        this.lastSearchStats = stats;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to loading state
    this.subscriptions.add(
      this.searchResultsService.loading$.subscribe(loading => {
        this.isLoading = loading;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  hasResults(): boolean {
    const hasResults = this.searchResults.length > 0;

    return hasResults;
  }

  toggleQueryExpansion(resultId: string) {
    this.searchResults = this.searchResults.map(result => {
      if (result.id === resultId) {
        return { ...result, expanded: !result.expanded };
      }
      return result;
    });
  }

  getCandidateClasses(candidate: any): string {
    return `status-${candidate.status}`;
  }

  inviteCandidate(candidate: any) {

    // get job description
    const jd = getJD().trim();

    const candidateInfo = {
      candidateEmail: candidate.email,
      candidateName: candidate.name,
      jobDescription: jd,
      interviewType: "ai"
    }

    if (!candidateInfo.candidateEmail || !candidateInfo.candidateName || !candidateInfo.jobDescription || !candidateInfo.interviewType)
      return;

    this.http.post(`${environment.NODE_BASE_URL}/interview/invite`, candidateInfo, { withCredentials: true })
      .subscribe({
        next: (response: any) => {

          this.searchResultsService.updateCandidateStatus(candidate.id, 'invited');
        },
        error: (error) => {
          console.error('Invite error:', error);
        }
      });
  }

  rejectCandidate(candidate: any) {
    const candidateInfo = {
      hrId: "685843dc5af72037a2beb9d4",
      candidateEmail: candidate.email ? candidate.email : 'ankitnarang255@gmail.com',
      candidateName: candidate.name,
      interviewType: "ai"
    }

    this.http.post(`${environment.NODE_BASE_URL}/interview/reject`, candidateInfo, { withCredentials: true })
      .subscribe({
        next: (response: any) => {
          this.searchResultsService.updateCandidateStatus(candidate.id, 'rejected');
        },
        error: (error) => {
          console.error('Reject error:', error);
        }
      });
  }
}