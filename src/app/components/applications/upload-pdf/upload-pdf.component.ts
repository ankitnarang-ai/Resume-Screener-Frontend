import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { environment } from '../../../../../environment';

@Component({
  standalone: true,
  selector: 'app-upload-pdf',
  templateUrl: './upload-pdf.component.html',
  styleUrls: ['./upload-pdf.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class UploadPdfComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  selectedFiles: File[] = [];
  uploadStatus = '';
  isLoading = false;
  isDragging = false;

  constructor(private http: HttpClient, private router: Router) {}

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.selectedFiles = Array.from(event.dataTransfer.files).filter(
        file => file.type === 'application/pdf'
      );
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  clearFiles() {
    this.selectedFiles = [];
    this.fileInput.nativeElement.value = '';
  }

  uploadFiles() {
    if (!this.selectedFiles.length) return;
    
    this.isLoading = true;
    this.uploadStatus = '';
    
    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('files', file));

    // this.http.post(`${environment.BASE_URL}/upload-and-process`, formData)
     this.http.post(`${environment.NODE_BASE_URL}/resume/upload-process`, formData, {
      withCredentials: true,
     })
      .subscribe({
        next: () => {
          this.uploadStatus = 'Success! Resumes analyzed successfully.';
          this.router.navigate(['/chat']); // Navigate to chat after successful upload
          this.isLoading = false;
        },
        error: () => {
          this.uploadStatus = 'Error analyzing resumes. Please try again.';
          this.isLoading = false;
        }
      });
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const exp = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, exp)).toFixed(1)} ${units[exp]}`;
  }
}