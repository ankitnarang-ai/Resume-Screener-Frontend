import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  private readonly baseUrl = `${environment.NODE_BASE_URL}/interview`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch interviews for a user with optional pagination
   * @param userId The user's ID
   * @param pagination Whether pagination is enabled
   * @param page Page number (optional)
   * @param limit Number of items per page (optional)
   */
  getInterviews(userId: string, pagination = false, page?: number, limit?: number): Observable<any> {
    let params = new HttpParams();

    if (pagination) {
      if (page !== undefined) params = params.set('page', page.toString());
      if (limit !== undefined) params = params.set('limit', limit.toString());
    }

    return this.http
      .get(`${this.baseUrl}/get-interviews/${userId}`, { params, withCredentials: true } )
      .pipe(
        catchError((error) => {
          console.error('Error fetching interviews:', error);
          return throwError(() => error);
        })
      );
  }
}
