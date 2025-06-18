// src/app/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from './auth/register/register.component'; // <-- Aggiunto automaticamente
import { LoginComponent } from './auth/login/login.component';     // <-- Aggiunto automaticamente
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AccountActivateComponent } from './auth/account-activate/account-activate.component';

@NgModule({
  declarations: [
    RegisterComponent, // <-- Qui
    LoginComponent,
DashboardComponent,
AccountActivateComponent
  ],
  imports: [
    CommonModule,
FormsModule
  ]
})
export class AuthModule { }
