// src/app/auth/account-activate/account-activate.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../shared/notification.service';
@Component({
  selector: 'app-account-activate',
  templateUrl: './account-activate.component.html',
  styleUrls: ['./account-activate.component.css'],
standalone:false
})
export class AccountActivateComponent implements OnInit {
  message: string = 'Attivazione in corso...';
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {




    this.message = 'Il tuo account è stato attivato con successo! Ora puoi effettuare il login.';
    this.isSuccess = true;
    this.notificationService.show('success', this.message);

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 5000);//5sec
  }
}
