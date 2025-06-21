import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  standalone: true,
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class AskQuestionComponent implements AfterViewChecked {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  
  messages: Message[] = [];
  currentMessage = '';
  isLoading = false;
  private shouldScrollToBottom = false;

  suggestionQuestions = [
    'Find candidates with Python and machine learning experience',
    'Who has the most relevant experience for a senior software engineer role?',
    'Compare candidates based on their technical skills',
    'Which candidates have leadership or management experience?',
    'Find resumes with cloud computing experience (AWS, Azure, GCP)',
    'Who has the strongest educational background?',
    'Compare years of experience across all candidates',
    'Find candidates with specific programming languages'
  ];

  constructor(private http: HttpClient) {}

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  useSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.messageInput?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content: this.currentMessage,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const question = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    this.http.post('https://resume-screener-backend-zelt.onrender.com/ask', { question })
      .subscribe({
        next: (response: any) => {
          const assistantMessage: Message = {
            id: this.generateId(),
            role: 'assistant',
            content: this.formatAnswer(response.answer),
            timestamp: new Date()
          };
          
          this.messages.push(assistantMessage);
          this.isLoading = false;
          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Error:', error);
          this.isLoading = false;
        }
      });
  }

  private scrollToBottom() {
    const messageContainer = document.querySelector('.message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
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