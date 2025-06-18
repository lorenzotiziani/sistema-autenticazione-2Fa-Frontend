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
import { AuthService } from './auth.service'; // Importa il tuo AuthService
import { Router } from '@angular/router'; // Per reindirizzare al login
import { AuthResponse } from './auth-response.model'; // <-- Importa la nuova interfaccia

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  // Questo subject serve per mettere in coda le richieste mentre il refresh è in corso
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let authReq = request;
    const accessToken = this.authService.getAccessToken();

    // Aggiungi il token di accesso solo se presente e la richiesta non è per gli endpoint di login/registrazione
    // È importante non inviare il token JWT quando stai richiedendo un nuovo token (refresh)
    // o quando stai facendo il login/registrazione iniziale.
    // I tuoi URL per login/register/refresh devono essere specifici qui!
    const isAuthEndpoint = request.url.includes(`${this.authService.baseUrl}/login/`) ||
                           request.url.includes(`${this.authService.baseUrl}/register/`) ||
                           request.url.includes(`${this.authService.baseUrl}/refresh/`); // <-- Aggiungi anche refresh qui!

    if (accessToken && !isAuthEndpoint) {
      authReq = this.addToken(request, accessToken);
    }

    // Gestisci le risposte con errori
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Se è un 401, proviamo a refreshare il token
          return this.handle401Error(authReq, next);
        } else if (error.status === 403) {
          // Se è un 403 (Forbidden), significa che il token è valido ma non ha i permessi,
          // o il refresh ha fallito e l'utente deve riloggare.
          console.warn('Errore 403 (Forbidden). Token non autorizzato o sessione scaduta.');
          this.authService.logout();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }
        // Per tutti gli altri errori, rilancia l'errore
        return throwError(() => error);
      })
    );
  }

  // Aggiunge l'header Authorization alla richiesta
  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gestisce l'errore 401 (Unauthorized) per il refresh del token
  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null); // Resetta il subject, in attesa del nuovo token

      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken) {
        // Chiamata all'API di refresh del tuo backend Django
        // Usiamo this.authService.http per fare la richiesta diretta (senza passare dall'interceptor stesso!)
        // e specifichiamo il tipo di ritorno come AuthResponse.
        return this.authService.http.post<AuthResponse>(`${this.authService.baseUrl}/refresh/`, { refresh: refreshToken }).pipe(
          switchMap((tokenResponse: AuthResponse) => { // Qui usiamo AuthResponse
            this.isRefreshing = false;
            if (tokenResponse.access && tokenResponse.refresh) {
              this.authService.setTokens(tokenResponse.access, tokenResponse.refresh); // Salva i nuovi token
              this.refreshTokenSubject.next(tokenResponse.access); // Emetti il nuovo token di accesso
              // Riprova la richiesta originale con il nuovo token di accesso
              return next.handle(this.addToken(request, tokenResponse.access));
            } else {
              // Se la risposta del refresh non contiene i token, forziamo il logout
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => new Error('Invalid refresh token response.'));
            }
          }),
          catchError((err) => {
            // Se il refresh fallisce (es. refresh token scaduto o invalido), logout
            this.isRefreshing = false;
            console.error('Refresh token failed:', err);
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      } else {
        // Nessun refresh token disponibile, logout diretto
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available.'));
      }
    } else {
      // Se un'operazione di refresh è già in corso, metti in coda la richiesta corrente
      // e attendi che il nuovo token sia disponibile.
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null), // Aspetta che il nuovo token venga emesso
        take(1), // Prendi il primo token emesso e poi completa
        switchMap(token => next.handle(this.addToken(request, token))) // Riprova la richiesta
      );
    }
  }
}
