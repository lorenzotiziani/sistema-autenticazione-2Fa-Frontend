// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard'; // Lo creeremo a breve!
import { AccountActivateComponent } from './auth/account-activate/account-activate.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
{ path: 'activate', component: AccountActivateComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, // Protetto da AuthGuard
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Reindirizza al login di default
  { path: '**', redirectTo: '/login' } // Gestisce rotte non trovate
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
