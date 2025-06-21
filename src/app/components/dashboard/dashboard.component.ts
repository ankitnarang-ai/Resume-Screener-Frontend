import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { UploadPdfComponent } from '../upload-pdf/upload-pdf.component';
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterModule]
})
export class DashboardComponent {

  constructor(private router: Router) {}
  activeFeature: string = 'resume';

  setActiveFeature(feature: string): void {
    this.activeFeature = feature;

    if (feature === 'resume') {
      this.router.navigate(['upload']); 
    }
  }
}