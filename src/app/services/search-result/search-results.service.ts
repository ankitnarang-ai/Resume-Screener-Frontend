// services/search-results.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface SearchResult {
  id: string;
  query: string;
  matchType: 'strong' | 'moderate';
  timestamp: Date;
  candidates: Candidate[];
  expanded?: boolean;
}

interface Candidate {
  id: string;
  name: string;
  email?: string;
  filename: string;
  matchType: 'strong' | 'moderate';
  status: 'pending' | 'invited' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class SearchResultsService {
  private resultsSubject = new BehaviorSubject<SearchResult[]>([]);
  private statsSubject = new BehaviorSubject<string>('');
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public results$ = this.resultsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  // Getters
  getResults(): SearchResult[] {
    return this.resultsSubject.value;
  }

  getStats(): string {
    return this.statsSubject.value;
  }

  getLoadingState(): boolean {
    return this.loadingSubject.value;
  }

  // Setters
  setResults(results: SearchResult[]): void {
    this.resultsSubject.next(results);
  }

  addResult(result: SearchResult): void {
    const currentResults = this.resultsSubject.value;
    this.resultsSubject.next([result, ...currentResults]);
  }

  updateResult(updatedResult: SearchResult): void {
    const currentResults = this.resultsSubject.value;
    const index = currentResults.findIndex(r => r.id === updatedResult.id);
    if (index !== -1) {
      currentResults[index] = updatedResult;
      this.resultsSubject.next([...currentResults]);
    }
  }

  setStats(stats: string): void {
    this.statsSubject.next(stats);
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  clearResults(): void {
    this.resultsSubject.next([]);
    this.statsSubject.next('');
    this.loadingSubject.next(false);
  }

  // Candidate methods
  updateCandidateStatus(candidateId: string, status: 'pending' | 'invited' | 'rejected'): void {
    const currentResults = this.resultsSubject.value;
    let updated = false;

    currentResults.forEach(result => {
      result.candidates.forEach(candidate => {
        if (candidate.id === candidateId) {
          candidate.status = status;
          updated = true;
        }
      });
    });

    if (updated) {
      this.resultsSubject.next([...currentResults]);
    }
  }

  getCandidateById(candidateId: string): Candidate | null {
    const currentResults = this.resultsSubject.value;
    
    for (const result of currentResults) {
      const candidate = result.candidates.find(c => c.id === candidateId);
      if (candidate) {
        return candidate;
      }
    }
    
    return null;
  }

  // Statistics methods
  getTotalCandidates(): number {
    const currentResults = this.resultsSubject.value;
    return currentResults.reduce((total, result) => total + result.candidates.length, 0);
  }

  getStrongMatches(): number {
    const currentResults = this.resultsSubject.value;
    return currentResults.reduce((total, result) => {
      return total + result.candidates.filter(c => c.matchType === 'strong').length;
    }, 0);
  }

  getModerateMatches(): number {
    const currentResults = this.resultsSubject.value;
    return currentResults.reduce((total, result) => {
      return total + result.candidates.filter(c => c.matchType === 'moderate').length;
    }, 0);
  }

  getInvitedCount(): number {
    const currentResults = this.resultsSubject.value;
    return currentResults.reduce((total, result) => {
      return total + result.candidates.filter(c => c.status === 'invited').length;
    }, 0);
  }

  getRejectedCount(): number {
    const currentResults = this.resultsSubject.value;
    return currentResults.reduce((total, result) => {
      return total + result.candidates.filter(c => c.status === 'rejected').length;
    }, 0);
  }
}