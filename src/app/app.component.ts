// src/app/app.component.ts
import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service'; // Importa l'AuthService
import { Router } from '@angular/router'; // Importa Router per la navigazione

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
standalone:false
})
export class AppComponent {
  title = 'my-angular-auth-app';

  // Inietta l'AuthService e il Router
  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Reindirizza al login dopo il logout
  }
}
