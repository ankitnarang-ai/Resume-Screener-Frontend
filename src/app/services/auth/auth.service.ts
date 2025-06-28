import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, firstValueFrom, timer } from 'rxjs';
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
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private authStateInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize auth state with a promise to handle race conditions
    this.initializationPromise = this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.authStateInitialized = true;
      return;
    }

    try {
      // Wait a bit for cookies to be fully available
      await this.delay(100);
      
      // Check for token with retries
      const token = await this.getTokenWithRetry();
      console.log('Initial token check:', token);
      
      if (token) {
        // Set initial state to true
        this.isLoggedInSubject.next(true);
        
        // Verify token in background
        try {
          await firstValueFrom(this.verifyToken());
          console.log('Token verified successfully');
        } catch (error) {
          console.log('Token verification failed:', error);
          this.isLoggedInSubject.next(false);
          this.clearAuthState();
        }
      } else {
        this.isLoggedInSubject.next(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      this.isLoggedInSubject.next(false);
    } finally {
      this.authStateInitialized = true;
    }
  }

  private async getTokenWithRetry(maxRetries = 3): Promise<string | null> {
    for (let i = 0; i < maxRetries; i++) {
      const token = this.getCookie('token');
      if (token) {
        return token;
      }
      // Wait before retry
      if (i < maxRetries - 1) {
        await this.delay(50);
      }
    }
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getCookie(name: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift() || null;
        console.log(`Cookie ${name}:`, cookieValue);
        return cookieValue;
      }
    } catch (error) {
      console.error('Error reading cookie:', error);
    }
    return null;
  }

  private clearAuthState(): void {
    // Clear cookie if possible
    if (isPlatformBrowser(this.platformId)) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('Attempting login...');
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/public/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(async (response) => {
        console.log('Login response:', response);
        
        // Wait a bit for cookie to be set
        await this.delay(100);
        
        const token = await this.getTokenWithRetry();
        console.log('Cookie after login:', token);
        
        if (token) {
          // Set authentication state to true
          this.isLoggedInSubject.next(true);
          
          // Navigate to dashboard after successful login
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Token not found after login');
          this.isLoggedInSubject.next(false);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        this.isLoggedInSubject.next(false);
        return throwError(() => error);
      })
    );
  }

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
        console.error('Token verification failed:', error);
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
        this.clearAuthState();
        this.router.navigate(['/login']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state
        this.isLoggedInSubject.next(false);
        this.clearAuthState();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  async isAuthenticated(): Promise<boolean> {
    // Wait for initialization to complete
    await this.waitForInitialization();
    
    const token = await this.getTokenWithRetry();
    const isAuth = !!token && this.isLoggedInSubject.value;
    console.log('isAuthenticated check:', isAuth, 'token present:', !!token, 'subject value:', this.isLoggedInSubject.value);
    return isAuth;
  }

  // Synchronous version for cases where you can't use async
  isAuthenticatedSync(): boolean {
    const token = this.getCookie('token');
    const isAuth = !!token && this.isLoggedInSubject.value;
    console.log('isAuthenticatedSync check:', isAuth);
    return isAuth;
  }

  getCurrentAuthState(): boolean {
    return this.isLoggedInSubject.value;
  }

  isAuthStateInitialized(): boolean {
    return this.authStateInitialized;
  }

  // Wait for the service to be fully initialized
  async waitForInitialization(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  // Method for route guards
  async waitForAuthState(): Promise<boolean> {
    await this.waitForInitialization();
    return this.isAuthenticatedSync();
  }

  refreshAuthState(): void {
    this.authStateInitialized = false;
    this.initializationPromise = this.initializeAuthState();
  }
}