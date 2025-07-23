import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  children?: MenuItem[];
  isOpen?: boolean;
  role?: string[]; // roles allowed to view this item
  isLogout?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  // Initial menuItems (unfiltered)
  private fullMenu: MenuItem[] = [
    {
      icon: 'home',
      label: 'Dashboard',
      route: '/dashboard',
      role: ['hr'],
      isOpen: false,
    },
    {
      icon: 'computer',
      label: 'Your Interviews',
      route: '/interviews',
      role: ['candidate'],
      isOpen: false,
    },
    {
      icon: 'description',
      label: 'Resume Analyzer',
      route: '/upload',
      role: ['hr'],
      isOpen: false,
    },
    {
      icon: 'analytics',
      label: 'Analytics',
      route: '/analytics',
      role: ['hr'],
      isOpen: false,
    },
  ];

  menuItems: MenuItem[] = [];

  logoutItem: MenuItem = {
    icon: 'logout',
    label: 'Logout',
    isLogout: true
  };

  activeItem: MenuItem | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.filterMenuItemsByRole();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.setActiveItemFromRoute();
    });

    this.setActiveItemFromRoute();
  }

  // Filter based on user role
  filterMenuItemsByRole() {
    const role = this.authService.currentUserValue?.role; // Assuming role is stored in currentUserValue

    if (!role) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.fullMenu
      .filter(item => !item.role || item.role.includes(role))
      .map(item => {
        const newItem = { ...item };
        if (newItem.children) {
          newItem.children = newItem.children.filter(
            child => !child.role || child.role.includes(role)
          );
        }
        return newItem;
      });
  }

  setActiveItemFromRoute() {
    const currentUrl = this.router.url;
    let matchedItem: MenuItem | null = null;

    for (const item of this.menuItems) {
      // Exact match or subpath match (e.g., /interviews or /interviews/ai-interview)
      if (item.route && currentUrl.startsWith(item.route)) {
        matchedItem = item;
        item.isOpen = true;
        break;
      }

      // If the item has children
      if (item.children) {
        for (const child of item.children) {
          if (child.route && currentUrl.startsWith(child.route)) {
            matchedItem = child;
            item.isOpen = true;
            break;
          }
        }
      }

      if (matchedItem) break;
    }

    this.activeItem = matchedItem;
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleMenuItem(item: MenuItem) {
    if (item.children) {
      item.isOpen = !item.isOpen;
    }

    if (item.route || !item.children) {
      this.selectMenuItem(item);
    }
  }

  selectMenuItem(item: MenuItem) {
    if (item.isLogout) {
      this.logout();
      if (window.innerWidth <= 768) {
        this.sidebarToggle.emit();
      }
      return;
    }

    this.activeItem = item;
    if (item.route) {
      this.router.navigate([item.route]);
      if (window.innerWidth <= 768) {
        this.sidebarToggle.emit();
      }
    }
  }

  isChildOfActive(item: MenuItem): boolean {
    if (!this.activeItem || !item.children) {
      return false;
    }
    return item.children.some(child =>
      child === this.activeItem ||
      (child.route && this.activeItem?.route && child.route === this.activeItem.route)
    );
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
