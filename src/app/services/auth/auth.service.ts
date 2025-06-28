import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, firstValueFrom, timer, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';
import { environment } from '../../../../environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClient
  ){}

  checkAuthStatus(): Observable<boolean> {
    return this.httpClient.get<{ isAuthenticated: boolean }>(`${environment.NODE_BASE_URL}/verify-token`, {withCredentials: true}).pipe(
      map(response => {
        return response.isAuthenticated || true; // If backend just sends 200, assume true
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('Authentication check failed:', error.message);
          return of(false); // Not authenticated
        }
        console.error('Error during authentication check:', error);
        return of(false); // Assume not authenticated for safety
      })
    );
  }


  login(credentials: LoginRequest): Observable<any> {
    return this.httpClient.post(`${environment.NODE_BASE_URL}/public/login`, credentials, {
      withCredentials: true
    })
  }

  signup(credentials: SignupRequest): Observable<any> {
    return this.httpClient.post(`${environment.NODE_BASE_URL}/public/signup`, credentials, {
      withCredentials: true
    })
  }

  logout():Observable<any> {
    return this.httpClient.post(`${environment.NODE_BASE_URL}/public/logout`, {}, {
      withCredentials: true
    })
  }

}