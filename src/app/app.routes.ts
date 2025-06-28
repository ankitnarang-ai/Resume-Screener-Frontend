import { Routes } from '@angular/router';
import { UploadPdfComponent } from './components/upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './components/ask-question/ask-question.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SearchResultsComponent } from './components/ask-question/components/search-results/search-results.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { GuestGuard } from './guard/guest/guest.guard';
import { SignupComponent } from './components/authentication/signup/signup.component';
import { AuthGuard } from './guard/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
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
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard] // Protect dashboard route
  },
  // Add more protected routes here
  // { 
  //   path: 'profile', 
  //   loadComponent: () => import('./profile.component').then(c => c.ProfileComponent),
  //   canActivate: [AuthGuard]
  // },
  
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
  { path: '**', redirectTo: '/dashboard' } ,
];
