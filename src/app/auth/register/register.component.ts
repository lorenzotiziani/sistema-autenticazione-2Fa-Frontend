import { NotificationService } from './../../shared/notification.service';
// src/app/auth/register/register.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
standalone:false
})
export class RegisterComponent {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router,private notificationService:NotificationService) { }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      email: this.email,
      password: this.password,
      first_name: this.firstName,
      last_name: this.lastName
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.notificationService.show('success', response.message || 'Registrazione completata! Controlla la tua email per attivare l\'account.');

      },
      error: (err) => {
        console.error('Errore di registrazione:', err);
        const errorMessage = err.error?.message || err.error?.email?.[0] || 'Errore durante la registrazione.';
        this.notificationService.show('error', errorMessage);
      }
    });
  }
}
