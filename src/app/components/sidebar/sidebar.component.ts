import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  icon: string; // Now holds Material icon names (e.g., 'home', 'settings')
  label: string;
  children?: MenuItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, MatIconModule],
  standalone: true
})
export class SidebarComponent {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Dashboard',
      isOpen: false,
      children: [
        { icon: 'pie_chart', label: 'Analytics' },
        { icon: 'folder', label: 'Projects' },
      ]
    },
    {
      icon: 'settings',
      label: 'Settings',
      isOpen: false,
      children: [
        { icon: 'person', label: 'Profile' },
        { icon: 'lock', label: 'Security' },
      ]
    },
    {
      icon: 'mail',
      label: 'Messages'
    }
  ];

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleMenuItem(item: MenuItem) {
    if (!this.isSidebarCollapsed && item.children) {
      item.isOpen = !item.isOpen;
    }
  }
}