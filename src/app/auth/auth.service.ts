// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from './auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public baseUrl = 'http://localhost:8000/api/auth';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasTokens());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(public http: HttpClient) { }

  private hasTokens(): boolean {
    return !!localStorage.getItem('access_token') && !!localStorage.getItem('refresh_token');
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register/`, userData);
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/`, credentials).pipe(
      tap(response => {
        if (response.access && response.refresh) {
          this.setTokens(response.access, response.refresh);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  verifyOtp(otpData: { otp: string; temp_token?: string }): Observable<AuthResponse> {
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

      const body = otp ? { otp: otp } : {};

      return this.http.post<AuthResponse>(`${this.baseUrl}/2fa/enable/`, body).pipe(
        tap(response => {
          if (response.access && response.refresh) {
            this.setTokens(response.access, response.refresh);
          }
        })
      );
    }

  disable2FA(): Observable<AuthResponse> {
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
