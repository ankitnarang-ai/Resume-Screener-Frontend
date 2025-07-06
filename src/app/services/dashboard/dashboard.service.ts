import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(private httpClient: HttpClient) {}

  getAnalytics(): Observable<any> {
      return this.httpClient.get(`${environment.NODE_BASE_URL}/resume/analytics`, {
        withCredentials: true
      });
    }
}
