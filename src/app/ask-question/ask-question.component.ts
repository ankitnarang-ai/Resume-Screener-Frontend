import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AskQuestionComponent {
  question = '';
  answer = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  askQuestion() {
    if (!this.question.trim()) return;
    
    this.isLoading = true;
    this.answer = '';
    
    this.http.post('http://localhost:8000/ask', { question: this.question })
      .subscribe({
        next: (response: any) => {
          this.answer = this.formatAnswer(response.answer);
          this.isLoading = false;
        },
        error: () => {
          this.answer = 'Error getting answer';
          this.isLoading = false;
        }
      });
  }

  private formatAnswer(answer: string): string {
    // Simple formatting for better display
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/### (.*?)\n/g, '<h3>$1</h3>') // Headers
      .replace(/✓/g, '✅') // Checkmarks
      .replace(/✗/g, '❌') // X marks
      .replace(/\n/g, '<br>'); // Line breaks
  }
}