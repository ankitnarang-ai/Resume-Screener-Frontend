// search-results.component.ts
import { Component, OnInit } from '@angular/core';
import { SearchResultsService } from '../../../../services/search-result/search-results.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  searchResults: any[] = [];
  lastSearchStats: string = '';
  isLoading: boolean = false;

  constructor(private searchResultsService: SearchResultsService) {}

  ngOnInit() {
    this.searchResultsService.results$.subscribe(results => {
      this.searchResults = results;
    });

    this.searchResultsService.stats$.subscribe(stats => {
      this.lastSearchStats = stats;
    });

    this.searchResultsService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  hasResults(): boolean {
    return this.searchResults.length > 0;
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
    this.searchResultsService.updateCandidateStatus(candidate.id, 'invited');
  }

  rejectCandidate(candidate: any) {
    this.searchResultsService.updateCandidateStatus(candidate.id, 'rejected');
  }
}