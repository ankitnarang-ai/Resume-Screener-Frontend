import { ChangeDetectionStrategy, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [SidebarComponent, RouterModule, CommonModule, MatIconModule],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsComponent implements OnInit {
  isSidebarCollapsed = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object){};

  ngOnInit() {
    // Initialize sidebar state based on screen size
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeSidebarOnMobile() {
    // Only close on mobile
     if (isPlatformBrowser(this.platformId) && window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
    if (window.innerWidth <= 768) {
      this.isSidebarCollapsed = true;
    } else {
      this.isSidebarCollapsed = false;
    }
  }
  }
}