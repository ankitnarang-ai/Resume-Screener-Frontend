import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if user is already logged in on service initialization
    this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    // First check if token exists in cookies
    const tokenExists = !!this.getCookie('token');
    console.log('Token exists in cookies:', tokenExists);
    
    if (tokenExists) {
      // Verify token with backend
      try {
        await this.verifyToken().toPromise();
      } catch (error) {
        console.log('Token verification failed:', error);
        this.isLoggedInSubject.next(false);
      }
    } else {
      this.isLoggedInSubject.next(false);
    }
  }

  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login...');
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/public/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap((response) => {
        console.log('Login response:', response);
        console.log('Cookie after login:', this.getCookie('token'));
        
        // Set authentication state to true
        this.isLoggedInSubject.next(true);
        
        // Navigate to dashboard after successful login
        this.router.navigate(['/dashboard']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        this.isLoggedInSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Enhanced method to verify token with backend
  verifyToken(): Observable<boolean> {
    console.log('Verifying token...');
    
    return this.http.get<any>(`${this.apiUrl}/verify-token`, {
      withCredentials: true
    }).pipe(
      map((response) => {
        console.log('Token verification response:', response);
        this.isLoggedInSubject.next(true);
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.isLoggedInSubject.next(false);
        return throwError(() => new Error('Token verification failed'));
      })
    );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/public/signup`, userData, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    console.log('Logging out...');
    
    return this.http.post(`${this.apiUrl}/public/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        console.log('Logout successful');
        this.isLoggedInSubject.next(false);
        this.router.navigate(['/login']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state
        this.isLoggedInSubject.next(false);
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.getCookie('token') && this.isLoggedInSubject.value;
    console.log('isAuthenticated check:', isAuth);
    return isAuth;
  }

  // Method to get current authentication state synchronously
  getCurrentAuthState(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Method to manually refresh auth state
  refreshAuthState(): void {
    this.initializeAuthState();
  }
}