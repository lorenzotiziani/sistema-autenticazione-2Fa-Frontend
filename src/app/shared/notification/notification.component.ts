// src/app/shared/notification/notification.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
standalone:false
})
export class NotificationComponent implements OnInit, OnDestroy {
  currentNotification: Notification | null = null;
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$.subscribe(
      (notification: Notification) => {
        this.currentNotification = notification.message ? notification : null;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }


  closeNotification(): void {
    this.notificationService.clear();
  }
}
