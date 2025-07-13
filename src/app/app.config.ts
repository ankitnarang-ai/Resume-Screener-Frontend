import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, PLATFORM_ID, inject } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { inject as injectAnalytics } from '@vercel/analytics';

export function initializeApp(authService: AuthService) {
  return () => firstValueFrom(authService.checkAuthStatus());
}

export function initializeAnalytics(): () => void {
  return () => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      injectAnalytics();
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAnalytics,
      multi: true
    },
    provideHttpClient(withInterceptorsFromDi())
  ]
};