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

export const routes: Routes = [
  // Authentication Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard] // Prevent authenticated users from accessing login
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [GuestGuard] // Prevent authenticated users from accessing signup
  },
  {
    path: 'role-selection',
    loadComponent: () => import('./components/authentication/role-selection/role-selection.component')
      .then(m => m.RoleSelectionComponent)
  },
  
  // Protected Application Routes
  // These routes require authentication and use the ApplicationsComponent as a layout
  {
    path: '',
    component: ApplicationsComponent,
    // canActivate: [AuthGuard], // Protect all child routes within this parent
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'ai-interview',
        component: AiInterviewComponent
      },
      {
        path: 'upload',
        component: UploadPdfComponent,
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
        path: '', // Default child route for '' (e.g., when navigating to just '/')
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
    ]
  },

  // Redirect any unmatched paths to the dashboard (or login if not authenticated)
  // This must be the last route in your configuration
  { path: '**', redirectTo: '/dashboard' }
];