// ask-question.component.ts
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environment';
import { SearchResultsService } from '../../services/search-result/search-results.service';

interface JobTemplate {
  id: string;
  title: string;
  summary: string;
  icon: string;
  description: string;
}

interface SearchResult {
  id: string;
  query: string;
  matchType: 'strong' | 'moderate';
  timestamp: Date;
  candidates: Candidate[];
  expanded?: boolean;
}

interface Candidate {
  id: string;
  name: string;
  filename: string;
  email?: string;
  matchType: 'strong' | 'moderate';
  status: 'pending' | 'invited' | 'rejected';
}

@Component({
  standalone: true,
  selector: 'app-ask-question',
  templateUrl: './ask-question.component.html',
  styleUrls: ['./ask-question.component.scss'],
  imports: [CommonModule, FormsModule, MatIconModule],
})
export class AskQuestionComponent {
  @ViewChild('jobDescriptionInput') jobDescriptionInput!: ElementRef<HTMLTextAreaElement>;
  
  jobDescription = '';
  matchType: 'strong' | 'moderate' = 'moderate';
  isLoading = false;

  jobTemplates: JobTemplate[] = [
    {
      id: 'senior-engineer',
      title: 'Senior Software Engineer',
      summary: 'Full-stack developer with 5+ years experience',
      icon: 'code',
      description: `We are seeking a Senior Software Engineer with:
• 5+ years of professional software development experience
• Strong proficiency in Python, JavaScript, or Java
• Experience with cloud platforms (AWS, Azure, or GCP)
• Bachelor's degree in Computer Science or related field
• Experience with databases (SQL/NoSQL)
• Knowledge of software development best practices and agile methodologies
• Strong problem-solving and communication skills`
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      summary: 'Strategic product leader with market analysis experience',
      icon: 'trending_up',
      description: `We are looking for a Product Manager with:
• 3+ years of product management experience
• Strong analytical and market research skills
• Experience with product roadmap development
• Bachelor's degree in Business, Engineering, or related field
• Excellent communication and stakeholder management skills
• Knowledge of agile development methodologies
• Experience with product analytics tools`
    },
    {
      id: 'ui-ux-designer',
      title: 'UI/UX Designer',
      summary: 'Creative designer with user-centered design expertise',
      icon: 'palette',
      description: `We are seeking a UI/UX Designer with:
• 3+ years of UI/UX design experience
• Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)
• Strong portfolio demonstrating user-centered design process
• Experience with user research and usability testing
• Knowledge of design systems and accessibility standards
• Bachelor's degree in Design, HCI, or related field
• Excellent visual design and prototyping skills`
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      summary: 'Analytical expert with machine learning experience',
      icon: 'analytics',
      description: `We are looking for a Data Scientist with:
• 4+ years of data science and analytics experience
• Strong proficiency in Python, R, or similar languages
• Experience with machine learning frameworks (TensorFlow, PyTorch, scikit-learn)
• Knowledge of statistical analysis and data modeling
• Experience with big data technologies (Spark, Hadoop)
• Master's degree in Data Science, Statistics, or related field
• Strong communication skills for presenting insights to stakeholders`
    }
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private searchResultsService: SearchResultsService
  ) {}

  canSearch(): boolean {
    return this.jobDescription.trim().length >= 20;
  }

  shouldShowTemplates(): boolean {
    return !this.jobDescription.trim();
  }

  useTemplate(template: JobTemplate) {
    this.jobDescription = template.description;
    this.focusTextarea();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      if (this.canSearch() && !this.isLoading) {
        this.findMatches();
      }
    }
  }

  clearForm() {
    this.jobDescription = '';
    this.matchType = 'moderate';
    this.focusTextarea();
  }

  findMatches() {
    if (!this.canSearch() || this.isLoading) return;

    this.isLoading = true;
    
    const searchResult: SearchResult = {
      id: this.generateId(),
      query: this.jobDescription,
      matchType: this.matchType,
      timestamp: new Date(),
      candidates: []
    };

    // Set loading state in service
    this.searchResultsService.setLoading(true);
    
    // Add to service and navigate to results
    this.searchResultsService.addResult(searchResult);
    this.router.navigate(['/results']);

    const question = `Find ${this.matchType} matches for the following job description:\n\n${this.jobDescription}`;

    this.http.post(`${environment.BASE_URL}/ask`, { question })
      .subscribe({
        next: (response: any) => {
          const candidates = this.parseResponse(response.answer);
          searchResult.candidates = candidates;
          this.searchResultsService.updateResult(searchResult);
          this.searchResultsService.setStats(`${candidates.length} candidates analyzed`);
        },
        error: (error) => {
          console.error('Search error:', error);
          searchResult.candidates = [];
          this.searchResultsService.updateResult(searchResult);
          this.searchResultsService.setStats('Search failed - please try again');
        },
        complete: () => {
          this.isLoading = false;
          this.searchResultsService.setLoading(false);
        }
      });
  }

  private parseResponse(answer: string): Candidate[] {
    
    const candidates: Candidate[] = [];
    const lines = answer.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('- Strong Match:') || trimmedLine.startsWith('- Moderate Match:')) {
        const isStrongMatch = trimmedLine.startsWith('- Strong Match:');
        const matchType = isStrongMatch ? 'strong' : 'moderate';
        const content = trimmedLine.replace(/- (Strong|Moderate) Match:\s*/, '');
        const parts = content.split(' | ');
        
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const filename = parts[1].trim();
          const email = parts[2]?.trim();
          
          candidates.push({
            id: this.generateId(),
            name,
            filename,
            email: email || '',
            matchType,
            status: 'pending'
          });
        }
      }
    });
    
    return candidates;
  }

  private focusTextarea() {
    setTimeout(() => {
      this.jobDescriptionInput?.nativeElement.focus();
    }, 100);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}