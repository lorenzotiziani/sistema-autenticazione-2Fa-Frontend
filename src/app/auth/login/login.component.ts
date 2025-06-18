// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
standalone:false
})
export class LoginComponent {
  email!: string;
  password!: string;
  otpCode: string = '';
  tempToken: string = ''; // Per il token temporaneo usato nella 2FA
  showOtpForm: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router,private notificationService: NotificationService) { }

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showOtpForm = false; // Resetta lo stato del form OTP
    console.log('TEMP TOKEN RICEVUTO:', this.tempToken);
    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.message === 'OTP richiesto' && response.temp_token) {
          this.tempToken = response.temp_token;
          this.showOtpForm = true;
          this.notificationService.show('info', 'Autenticazione a due fattori richiesta. Inserisci il codice OTP.');
        } else if (response.access && response.refresh) {
          this.notificationService.show('success', 'Login riuscito!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Errore di login:', err);
        const errorMessage = err.error?.error || 'Credenziali non valide o account non attivo.';
        this.notificationService.show('error', errorMessage);
      }
    });
  }

  onVerifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otpCode) {
      this.errorMessage = 'Inserisci il codice OTP.';
      return;
    }

    const otpData = {
      otp: this.otpCode,
      temp_token: this.tempToken
    };

    this.authService.verifyOtp(otpData).subscribe({
      next: (response) => {
        if (response.access && response.refresh) {
          this.tempToken = '';
          this.notificationService.show('success', 'Verifica OTP riuscita. Accesso completato!');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Errore verifica OTP:', err);
        const errorMessage = err.error?.error || 'Codice OTP non valido.';
        this.notificationService.show('error', errorMessage);
        this.tempToken="";
        this.showOtpForm=false
      }
    });
  }
}
