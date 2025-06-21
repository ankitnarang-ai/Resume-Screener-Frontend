import { Routes } from '@angular/router';
import { UploadPdfComponent } from './components/upload-pdf/upload-pdf.component';
import { AskQuestionComponent } from './components/ask-question/ask-question.component';
import { LoginComponent } from './components/auth/login/login/login.component';
import { SignupComponent } from './components/auth/signup/signup.component';
import { AuthGuard } from './guards/auth-guard/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'upload', 
    component: UploadPdfComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'chat', 
    component: AskQuestionComponent,
    canActivate: [AuthGuard]
  },
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: '**', redirectTo: 'upload' }
];