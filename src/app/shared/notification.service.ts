
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
  private clearNotificationSubject = new Subject<void>();

  notification$ = this.notificationSubject.asObservable();

  constructor() { }

  show(type: Notification['type'], message: string, duration: number = 5000): void {
    this.clearNotificationSubject.next();

    this.notificationSubject.next({ type, message });


    timer(duration).pipe(
      takeUntil(this.clearNotificationSubject)
    ).subscribe(() => {
      this.clear();
    });
  }

  clear(): void {
    this.notificationSubject.next({ type: 'info', message: '' });
  }
}
