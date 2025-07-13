// src/app/components/analytics/analytics.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-analytics',
  template: '',
  standalone: true
})
export class AnalyticsComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const { inject } = await import('@vercel/analytics');
        inject();
      } catch (error) {
        console.warn('Failed to load Vercel Analytics:', error);
      }
    }
  }
}