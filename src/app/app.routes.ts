import { Routes } from '@angular/router';
import { UploadPdfComponent } from './components/upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './components/ask-question/ask-question.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SearchResultsComponent } from './components/ask-question/components/search-results/search-results.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'upload',
    component: UploadPdfComponent
  },
  {
    path: 'chat',
    component: AskQuestionComponent
  },
  {
    path: 'results',
    component: SearchResultsComponent
  },
  {
  path: '**',
  redirectTo: ''}
];
