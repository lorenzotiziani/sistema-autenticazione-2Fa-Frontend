// src/app/auth/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AuthResponse } from './auth-response.model';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let authReq = request;
    const accessToken = this.authService.getAccessToken();

    const isAuthEndpoint = request.url.includes(`${this.authService.baseUrl}/login/`) ||
                           request.url.includes(`${this.authService.baseUrl}/register/`) ||
                           request.url.includes(`${this.authService.baseUrl}/refresh/`);

    if (accessToken && !isAuthEndpoint) {
      authReq = this.addToken(request, accessToken);
    }

    // Gestisci le risposte con errori
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {

          return this.handle401Error(authReq, next);
        } else if (error.status === 403) {

          console.warn('Errore 403 (Forbidden). Token non autorizzato o sessione scaduta.');
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }

        return throwError(() => error);
      })
    );
  }


  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken) {

        return this.authService.http.post<AuthResponse>(`${this.authService.baseUrl}/refresh/`, { refresh: refreshToken }).pipe(
          switchMap((tokenResponse: AuthResponse) => {
            this.isRefreshing = false;
            if (tokenResponse.access && tokenResponse.refresh) {
              this.authService.setTokens(tokenResponse.access, tokenResponse.refresh);
              this.refreshTokenSubject.next(tokenResponse.access);
              return next.handle(this.addToken(request, tokenResponse.access));
            } else {
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => new Error('Invalid refresh token response.'));
            }
          }),
          catchError((err) => {
            this.isRefreshing = false;
            console.error('Refresh token failed:', err);
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      } else {

        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available.'));
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token)))
      );
    }
  }
}
