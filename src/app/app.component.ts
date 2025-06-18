import { Component } from '@angular/core';
import { UploadPdfComponent } from './upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './ask-question/ask-question.component';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [UploadPdfComponent, AskQuestionComponent]
})
export class AppComponent {}