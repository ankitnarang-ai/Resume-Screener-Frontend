import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { filter } from 'rxjs/operators'; // Import filter
import { AuthService } from '../../../services/auth/auth.service';

interface MenuItem {
  icon: string; // Now holds Material icon names (e.g., 'home', 'settings')
  label: string;
  route?: string; // Add route property
  children?: MenuItem[];
  isOpen?: boolean;
  // New property to distinguish the logout button, so it doesn't navigate like other items
  isLogout?: boolean; 
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class SidebarComponent implements OnInit { // Implement OnInit
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Dashboard',
      route: '/dashboard', 
      isOpen: false,
    },
    {
      icon: 'description',
      label: 'Resume Analyzer',
      route: '/upload',
      isOpen: false,
    },
    {
      icon: 'analytics', 
      label: 'Analytics',
      route: '/analytics', 
      isOpen: false,
    },
    // {
    //   icon: 'videocam', // Changed icon for AI Interview
    //   label: 'AI Interview',
    //   route: '/ai-interview', // Example route
    //   isOpen: false,
    // },
    // {
    //   icon: 'settings',
    //   label: 'Settings',
    //   route: '/settings', // Example route
    //   isOpen: false,
    //   children: [
    //     { icon: 'person', label: 'Profile', route: '/settings/profile' }, // Example route
    //     { icon: 'lock', label: 'Security', route: '/settings/security' }, // Example route
    //   ]
    // },
  ];

  // Separate logout item for distinct handling and positioning
  logoutItem: MenuItem = {
    icon: 'logout',
    label: 'Logout',
    isLogout: true
  };

  activeItem: MenuItem | null = null; // To keep track of the active menu item

  constructor(
    private router: Router,
    private authService: AuthService
  ) {} // Inject Router

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveItemFromRoute();
    });
    this.setActiveItemFromRoute(); // Set active item on initial load
  }

  setActiveItemFromRoute() {
    const currentUrl = this.router.url;
    let found = false;
    for (const item of this.menuItems) {
      if (item.route === currentUrl) {
        this.activeItem = item;
        item.isOpen = true; // Open parent if a direct route match
        found = true;
        break;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.route === currentUrl) {
            this.activeItem = child;
            item.isOpen = true; // Open parent
            found = true;
            break;
          }
        }
      }
      if (found) break;
    }
    // Check if the current route matches a child of an active parent.
    // This handles cases where the route changes but the parent should remain open.
    if (!found) {
        this.activeItem = null;
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleMenuItem(item: MenuItem) {
    if (item.children) {
      item.isOpen = !item.isOpen;
    }
    // Only select the item if it has a route or no children
    // If on mobile and an item without children (or with a route) is clicked, close sidebar
    if (item.route || !item.children) {
      this.selectMenuItem(item);
    }
  }

  selectMenuItem(item: MenuItem) {
    if (item.isLogout) {
      this.logout();
      // On mobile, close sidebar after logout click
      if (window.innerWidth <= 768) {
        this.sidebarToggle.emit();
      }
      return;
    }
    this.activeItem = item;
    if (item.route) {
      this.router.navigate([item.route]);
      // If on a mobile screen, emit event to collapse/close the sidebar after selection
      if (window.innerWidth <= 768) {
        this.sidebarToggle.emit();
      }
    }
  }

  // Helper to check if a parent item should be highlighted because its child is active
  isChildOfActive(item: MenuItem): boolean {
    if (!this.activeItem || !item.children) {
      return false;
    }
    // Check if any child's route matches the active item's route, or if the activeItem itself is a child
    return item.children.some(child => child === this.activeItem || (child.route && this.activeItem?.route && child.route === this.activeItem.route));
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force redirect even if logout API fails
        this.router.navigate(['/login']);
      }
    });
  }
}