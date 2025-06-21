import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-upload-pdf',
  templateUrl: './upload-pdf.component.html',
  styleUrl: './upload-pdf.component.scss',
  imports: [CommonModule, FormsModule]
})
export class UploadPdfComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFiles: File[] = [];
  uploadStatus = '';
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.uploadStatus = '';
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) return;
    
    this.isLoading = true;
    this.uploadStatus = '';
    const formData = new FormData();
    
    for (const file of this.selectedFiles) {
      formData.append('files', file);
    }

    this.http.post('https://resume-screener-backend-zelt.onrender.com/upload-and-process/', formData)
      .subscribe({
        next: (response: any) => {
          this.uploadStatus = `Success! Processed ${this.selectedFiles.length} files.`;
          this.isLoading = false;
          // Navigate to chat after successful upload
          this.router.navigate(['/chat']);
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.uploadStatus = 'Error uploading files. Please try again.';
          this.isLoading = false;
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}