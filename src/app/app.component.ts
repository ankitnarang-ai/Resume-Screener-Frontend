import { Component } from '@angular/core';
import { UploadPdfComponent } from './components/upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './components/ask-question/ask-question.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterModule, CommonModule, SidebarComponent, MatIconModule]
})
export class AppComponent {
   isSidebarCollapsed = false;

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}