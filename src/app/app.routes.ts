import { Routes } from '@angular/router';
import { UploadPdfComponent } from './components/applications/upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './components/applications/ask-question/ask-question.component';
import { DashboardComponent } from './components/applications/dashboard/dashboard.component';
import { SearchResultsComponent } from './components/applications/ask-question/components/search-results/search-results.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { GuestGuard } from './guard/guest/guest.guard';
import { SignupComponent } from './components/authentication/signup/signup.component';
import { AuthGuard } from './guard/auth/auth.guard';
import { AiInterviewComponent } from './components/applications/ai-interview/ai-interview.component';
import { ApplicationsComponent } from './components/applications/applications.component';
import { AnalyticsComponent } from './components/applications/analytics/analytics.component';
import { InterviewsComponent } from './components/applications/interviews/interviews.component';

export const routes: Routes = [
  // Authentication Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [GuestGuard]
  },
  {
    path: 'role-selection',
    loadComponent: () => import('./components/authentication/role-selection/role-selection.component')
      .then(m => m.RoleSelectionComponent)
  },

  // Protected Application Routes
  {
    path: '',
    component: ApplicationsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      
      {
        path: 'interviews',
        component: InterviewsComponent,

      },
      {
        path: 'interviews/ai-interview/:id',
        component: AiInterviewComponent
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
        path: 'analytics',
        loadComponent: () => import('./components/applications/analytics/analytics.component')
          .then(m => m.AnalyticsComponent)
      },
      // Redirect empty path to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Redirect any unmatched paths
  {
    path: '**',
    redirectTo: 'dashboard' // or 'login' depending on your preference
  }
];