import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-upload-pdf',
  templateUrl: './upload-pdf.component.html',
  styleUrl:'./upload-pdf.component.scss',
  imports: [CommonModule, FormsModule]
})
export class UploadPdfComponent {
  selectedFiles: File[] = [];
  uploadStatus = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }
    
    this.isLoading = true;
    const formData = new FormData();
    
    for (const file of this.selectedFiles) {
      formData.append('files', file);
    }

    this.http.post('http://localhost:8000/upload-and-process/', formData)
      .subscribe({
        next: (response: any) => {
          this.uploadStatus = `Success! Processed into ${response.message}`;
          this.isLoading = false;
        },
        error: () => {
          this.uploadStatus = 'Error uploading files';
          this.isLoading = false;
        }
      });
  }
}