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
  user?: any; // Add user data if your backend sends it
}

export interface GoogleAuthRequest {
  token: string; // Google ID token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Optional: Add user state management if needed
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) { }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  checkAuthStatus(): Observable<boolean> {
    return this.httpClient.get<{ valid: boolean; user?: any }>(`${environment.NODE_BASE_URL}/authentication/verify-token`, { withCredentials: true }).pipe(
      map(response => {
        // Update user state if backend sends user data
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
        return response.valid ;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('Authentication check failed:', error.message);
          this.currentUserSubject.next(null); // Clear user state
          return of(false);
        }
        console.error('Error during authentication check:', error);
        this.currentUserSubject.next(null);
        return of(false);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.NODE_BASE_URL}/authentication/public/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        // Update user state if backend sends user data
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Traditional login failed:', error);
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  // NEW: Google OAuth login method
  loginWithGoogle(googleIdToken: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(
      `${environment.NODE_BASE_URL}/authentication/public/google-login`,
      { token: googleIdToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Google login failed:', error);
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }

  signupWithGoogle(googleIdToken: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(
      `${environment.NODE_BASE_URL}/authentication/public/google-signup`,
      { token: googleIdToken },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap(response => {
        if (response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Google signup failed:', error);
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }



  updateUserRole(userId: string, role: string): Observable<any> {

    return this.httpClient.put(`${environment.NODE_BASE_URL}/user/role`, { userId, role }, {
      withCredentials: true
    });
  }

  signup(credentials: SignupRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.NODE_BASE_URL}/authentication/public/signup`, credentials, {
      withCredentials: true
    });
  }

  logout(): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${environment.NODE_BASE_URL}/authentication/public/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(response => {
        // Clear user state on logout
        this.currentUserSubject.next(null);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout failed:', error);
        // Clear user state even if logout fails
        this.currentUserSubject.next(null);
        return throwError(() => error);
      })
    );
  }
}