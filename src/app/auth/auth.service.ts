// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from './auth-response.model'; // <-- Importa la nuova interfaccia

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public baseUrl = 'http://localhost:8000/api/auth'; // <--- MODIFICA CON L'URL DEL TUO BACKEND DJANGO

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasTokens());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(public http: HttpClient) { }

  private hasTokens(): boolean {
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('refresh_token');
  }

  register(userData: any): Observable<AuthResponse> { // Specifica il tipo di ritorno
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/`, userData);
  }

  login(credentials: any): Observable<AuthResponse> { // Specifica il tipo di ritorno
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/`, credentials).pipe(
      tap(response => {
        // TypeScript ora sa che 'response' può avere 'access' e 'refresh'
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  verifyOtp(otpData: { otp: string; temp_token?: string }): Observable<AuthResponse> { // Specifica il tipo di ritorno
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/verify-otp/`, otpData).pipe(
      tap(response => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  enable2FA(otp: string | null = null): Observable<AuthResponse> {
      // If you pass an OTP, it's for the final verification after scanning the QR
      // The backend should have an endpoint that expects an OTP and validates it
      // against the user's *newly set up* 2FA secret (which happened when they initially called enable2FA without OTP).
      const body = otp ? { otp: otp } : {};
      // Ensure this endpoint is correct for your Django backend to VERIFY the OTP
      // after QR code generation. It should be a protected endpoint.
      return this.http.post<AuthResponse>(`${this.baseUrl}/2fa/enable/`, body).pipe(
        tap(response => {
            // Update tokens after 2FA activation if new tokens are returned
          if (response.access && response.refresh) {
            this.setTokens(response.access, response.refresh);
          }
        })
      );
    }

  disable2FA(): Observable<AuthResponse> { // Specifica il tipo di ritorno
    return this.http.post<AuthResponse>(`${this.baseUrl}/2fa/disable/`, {}).pipe(
      tap(response => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
        }
      })
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticatedSubject.next(false);
  }

  logout(): void {
    this.clearTokens();
  }
}
