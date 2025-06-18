// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NotificationService } from '../shared/notification.service'; // Import for notifications

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone:false
})
export class DashboardComponent implements OnInit {
  qrCodeBase64: string | null = null;
  manualCode: string | null = null;
  otpVerifyCode: string = '';
  show2FAEnableForm: boolean = false;
  show2FADisableConfirm: boolean = false;
  twoFAMessage: string = ''; // No longer strictly needed if using NotificationService for all messages
  twoFAError: boolean = false; // No longer strictly needed

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService // Injected
  ) { }

  ngOnInit(): void {
    // Optional: Fetch user 2FA status from backend here if needed
  }

  logout(): void {
    this.authService.logout();
    this.notificationService.show('info', 'Hai effettuato il logout.');
    this.router.navigate(['/login']);
  }

  enable2fa(): void {
    this.notificationService.clear(); // Clear previous messages
    this.show2FADisableConfirm = false; // Hide disable form

    this.authService.enable2FA().subscribe({
      next: (response) => {
        if (response.qr_code_base64 && response.manual_code) {
          this.qrCodeBase64 = response.qr_code_base64;
          this.manualCode = response.manual_code;
          this.show2FAEnableForm = true;
          this.notificationService.show('info', 'Scansiona il QR Code e inserisci il codice OTP per completare l\'abilitazione.');
        } else {
          // This case might mean 2FA is already enabled or another message
          this.notificationService.show('info', response.message || '2FA setup initiated, check QR or already enabled.');
          if (!response.qr_code_base64) {
            // If no QR, maybe the backend says it's already enabled
            this.show2FAEnableForm = false; // Keep form hidden if no QR to scan
          }
        }
      },
      error: (err) => {
        console.error('Errore durante l\'abilitazione 2FA (richiesta iniziale QR):', err);
        this.notificationService.show('error', err.error?.message || 'Errore nell\'abilitare la 2FA.');
        this.show2FAEnableForm = false; // Hide form on error
      }
    });
  }

  confirm2FA(): void {
    this.notificationService.clear();

    if (!this.otpVerifyCode) {
      this.notificationService.show('error', 'Inserisci il codice OTP per verificare.');
      return;
    }

    // This is the key change: Call enable2FA with the OTP, not verifyOtp
    this.authService.enable2FA(this.otpVerifyCode).subscribe({
      next: (response) => {
        this.notificationService.show('success', response.message || '2FA abilitata e verificata con successo!');
        this.show2FAEnableForm = false; // Hide the form after success
        this.qrCodeBase64 = null;
        this.manualCode = null;
        this.otpVerifyCode = '';
      },
      error: (err) => {
        console.error('Errore durante la verifica OTP per 2FA (conferma abilitazione):', err);
        this.notificationService.show('error', err.error?.error || 'Codice OTP non valido o errore nella conferma.');
      }
    });
  }

  cancel2FAEnable(): void {
    this.show2FAEnableForm = false;
    this.qrCodeBase64 = null;
    this.manualCode = null;
    this.otpVerifyCode = '';
    this.notificationService.clear();
  }

  disable2fa(): void {
    this.notificationService.clear();
    this.show2FAEnableForm = false; // Hide enable form
    this.show2FADisableConfirm = true; // Show disable confirmation
    this.notificationService.show('info', 'Conferma la disabilitazione dell\'autenticazione a due fattori.');
  }

  confirmDisable2FA(): void {
    this.authService.disable2FA().subscribe({
      next: (response) => {
        this.notificationService.show('success', response.message || '2FA disabilitata con successo!');
        this.show2FADisableConfirm = false;
      },
      error: (err) => {
        console.error('Errore durante la disabilitazione 2FA:', err);
        this.notificationService.show('error', err.error?.message || 'Errore nella disabilitazione 2FA.');
      }
    });
  }

  cancel2FADisable(): void {
    this.show2FADisableConfirm = false;
    this.notificationService.clear();
  }
}
