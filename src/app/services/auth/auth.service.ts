// services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check initial auth state only in browser
    if (isPlatformBrowser(this.platformId)) {
      // const token = localStorage.getItem('auth_token');
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(email: string, password: string) {
    return ;
  }

  signup(name: string, email: string, password: string) {
   return;
  }

  logout() {
    console.log('Logging out');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}