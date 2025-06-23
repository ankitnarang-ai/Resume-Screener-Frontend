import { Component, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environment';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  jobDescription?: string;
  matchType?: string;
  candidates?: Candidate[];
}

interface Candidate {
  id: string;
  name: string;
  filename: string;
  matchType: 'strong' | 'moderate';
  reviewType: 'ai' | 'human';
  status: 'pending' | 'invited' | 'rejected';
}

@Component({
  standalone: true,
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    MatIconModule
  ],
})
export class AskQuestionComponent implements AfterViewChecked {
  @ViewChild('jobDescriptionInput') jobDescriptionInput!: ElementRef<HTMLTextAreaElement>;
  
  messages: Message[] = [];
  jobDescription = '';
  matchType = 'moderate'; // default to moderate
  isLoading = false;
  isDropdownOpen = false;
  private shouldScrollToBottom = false;
  openDropdowns: Set<string> = new Set();

  matchTypes = [
    { 
      value: 'strong', 
      viewValue: 'Strong Match',
      description: '100% mandatory requirements'
    },
    { 
      value: 'moderate', 
      viewValue: 'Moderate Match',
      description: '≥70% key requirements'
    }
  ];

  reviewTypes = [
    { value: 'ai', label: 'AI Review' },
    { value: 'human', label: 'Human Review' }
  ];

  sampleJobDescriptions = [
    {
      title: 'Senior Software Engineer',
      description: `We are looking for a Senior Software Engineer with:
• 5+ years of experience in Python programming
• Strong background in machine learning and AI
• Experience with cloud platforms (AWS, Azure, or GCP)
• Bachelor's degree in Computer Science or related field
• Experience with databases (SQL/NoSQL)
• Knowledge of software development best practices`
    },
    {
      title: 'Full Stack Developer',
      description: `Required qualifications:
• 3+ years of full-stack development experience
• Proficiency in JavaScript, React, Node.js
• Experience with databases (MongoDB, PostgreSQL)
• Knowledge of RESTful APIs and microservices
• Familiarity with version control (Git)
• Strong problem-solving skills`
    },
    {
      title: 'Data Scientist',
      description: `We need a Data Scientist with:
• Master's degree in Data Science, Statistics, or related field
• 4+ years of experience in data analysis and modeling
• Proficiency in Python, R, SQL
• Experience with machine learning frameworks (TensorFlow, PyTorch)
• Knowledge of statistical analysis and data visualization
• Experience with big data technologies`
    }
  ];

  constructor(private http: HttpClient) {}

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.custom-select');
    const candidateDropdown = target.closest('.candidate-review-dropdown');
    
    if (!dropdown) {
      this.isDropdownOpen = false;
    }
    
    if (!candidateDropdown) {
      this.openDropdowns.clear();
    }
  }

  // Dropdown methods
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCandidateDropdown(candidateId: string) {
    if (this.openDropdowns.has(candidateId)) {
      this.openDropdowns.delete(candidateId);
    } else {
      this.openDropdowns.clear();
      this.openDropdowns.add(candidateId);
    }
  }

  isCandidateDropdownOpen(candidateId: string): boolean {
    return this.openDropdowns.has(candidateId);
  }

  selectMatchType(value: string) {
    this.matchType = value;
    this.isDropdownOpen = false;
  }

  selectReviewType(candidateId: string, reviewType: any) {
    // Find the candidate and update their review type
    this.messages.forEach(message => {
      if (message.candidates) {
        const candidate = message.candidates.find(c => c.id === candidateId);
        if (candidate) {
          candidate.reviewType = reviewType;
        }
      }
    });
    this.openDropdowns.delete(candidateId);
  }

  inviteCandidate(candidateId: string) {
    // Find the candidate and update their status
    this.messages.forEach(message => {
      if (message.candidates) {
        const candidate = message.candidates.find(c => c.id === candidateId);
        if (candidate) {
          candidate.status = 'invited';
          console.log(`Inviting candidate: ${candidate.name} for interview`);
          // Here you would typically make an API call to invite the candidate
        }
      }
    });
  }

  rejectCandidate(candidateId: string) {
    // Find the candidate and update their status
    this.messages.forEach(message => {
      if (message.candidates) {
        const candidate = message.candidates.find(c => c.id === candidateId);
        if (candidate) {
          candidate.status = 'rejected';
          console.log(`Rejecting candidate: ${candidate.name}`);
          // Here you would typically make an API call to reject the candidate
        }
      }
    });
  }

  getSelectedMatchType() {
    return this.matchTypes.find(type => type.value === this.matchType) || this.matchTypes[1];
  }

  useSampleJobDescription(description: string) {
    this.jobDescription = description;
    this.jobDescriptionInput?.nativeElement.focus();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.findMatches();
    }
  }

  findMatches() {
    if (!this.jobDescription.trim() || this.isLoading) return;

    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content: `Job Description: ${this.jobDescription}\n\nMatch Type: ${this.getMatchTypeLabel()}`,
      timestamp: new Date(),
      jobDescription: this.jobDescription,
      matchType: this.matchType
    };

    this.messages.push(userMessage);
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Create the question in the format expected by your backend
    const question = `Find ${this.matchType} matches for the following job description:\n\n${this.jobDescription}`;

    this.http.post(`${environment.BASE_URL}/ask`, { question })
      .subscribe({
        next: (response: any) => {
          const candidates = this.parseAnswer(response.answer);
          const assistantMessage: Message = {
            id: this.generateId(),
            role: 'assistant',
            content: response.answer,
            timestamp: new Date(),
            candidates: candidates
          };
          
          this.messages.push(assistantMessage);
          this.isLoading = false;
          this.shouldScrollToBottom = true;
        },
        error: (error) => {
          console.error('Error:', error);
          const errorMessage: Message = {
            id: this.generateId(),
            role: 'assistant',
            content: 'Sorry, there was an error processing your request. Please try again.',
            timestamp: new Date()
          };
          this.messages.push(errorMessage);
          this.isLoading = false;
          this.shouldScrollToBottom = true;
        }
      });
  }

  clearForm() {
    this.jobDescription = '';
    this.matchType = 'moderate';
  }

  clearChat() {
    this.messages = [];
    this.openDropdowns.clear();
  }

  getMatchTypeLabel(): string {
    const matchType = this.matchTypes.find(type => type.value === this.matchType);
    return matchType ? `${matchType.viewValue} (${matchType.description})` : this.matchType;
  }

  private parseAnswer(answer: string): Candidate[] {
    const candidates: Candidate[] = [];
    const lines = answer.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- Strong Match:') || trimmedLine.startsWith('- Moderate Match:')) {
        const isStrongMatch = trimmedLine.startsWith('- Strong Match:');
        const matchType = isStrongMatch ? 'strong' : 'moderate';
        
        // Extract name and filename
        const content = trimmedLine.replace(/- (Strong|Moderate) Match:\s*/, '');
        const parts = content.split(' | ');
        
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const filename = parts[1].trim();
          
          candidates.push({
            id: this.generateId(),
            name,
            filename,
            matchType,
            reviewType: 'ai', // default to AI review
            status: 'pending'
          });
        }
      }
    });
    
    return candidates;
  }

  private scrollToBottom() {
    const messageContainer = document.querySelector('.results-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}