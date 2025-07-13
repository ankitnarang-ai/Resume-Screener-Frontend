import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/applications/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth/auth.service';
import { AnalyticsComponent } from './components/applications/analytics/analytics.component';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule, CommonModule, MatIconModule, SidebarComponent, AnalyticsComponent]
})
export class AppComponent {
  isSidebarCollapsed = false;

  constructor(
    private authService: AuthService
  ){
  }


  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}