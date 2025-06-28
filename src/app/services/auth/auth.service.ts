import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, firstValueFrom, timer, of } from 'rxjs';
import { map, tap, catchError, take } from 'rxjs/operators';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

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
  private apiUrl = 'http://localhost:3000/authentication'; 

  constructor(
    private httpClient: HttpClient
  ){}

  checkAuthStatus(): Observable<boolean> {
    return this.httpClient.get<{ isAuthenticated: boolean }>(`${this.apiUrl}/verify-token`, {withCredentials: true}).pipe(
      map(response => {
        // Assuming your backend responds with { isAuthenticated: true/false } on success
        // or just a 200 OK if authenticated, and 401 if not.
        return response.isAuthenticated || true; // If backend just sends 200, assume true
      }),
      catchError((error: HttpErrorResponse) => {
        // If backend responds with 401 Unauthorized, 403 Forbidden, or other errors
        // indicating no authentication, we return false.
        if (error.status === 401 || error.status === 403) {
          console.warn('Authentication check failed:', error.message);
          return of(false); // Not authenticated
        }
        // For other network errors or server issues, you might want to rethrow or log differently
        console.error('Error during authentication check:', error);
        return of(false); // Assume not authenticated for safety
      })
    );
  }


  login(credentials: LoginRequest): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/public/login`, credentials, {
      withCredentials: true
    })
  }

  signup(credentials: SignupRequest): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/public/signup`, credentials, {
      withCredentials: true
    })
  }

  logout():Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/public/logout`, {}, {
      withCredentials: true
    })
  }

}