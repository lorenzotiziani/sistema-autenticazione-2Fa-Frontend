// src/app/shared/notification.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private clearNotificationSubject = new Subject<void>(); // Per forzare la cancellazione

  notification$ = this.notificationSubject.asObservable();

  constructor() { }

  show(type: Notification['type'], message: string, duration: number = 5000): void {
    this.clearNotificationSubject.next(); // Cancella qualsiasi notifica precedente

    this.notificationSubject.next({ type, message });

    // Nasconde la notifica automaticamente dopo 'duration' millisecondi
    timer(duration).pipe(
      takeUntil(this.clearNotificationSubject) // Se una nuova notifica arriva, cancella questa
    ).subscribe(() => {
      this.clear();
    });
  }

  clear(): void {
    this.notificationSubject.next({ type: 'info', message: '' }); // Emetti un messaggio vuoto per nascondere
  }
}
