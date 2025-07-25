import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification$ | async as notification" class="notification {{notification.type}}">
      {{notification.message}}
      <button (click)="clear()">Close</button>
    </div>
  `,
  styles: [`
    .notification { position: fixed; top: 20px; right: 20px; padding: 10px; border-radius: 4px; }
    .success { background: green; color: white; }
    .error { background: red; color: white; }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification$ = this.notificationService.notification$;
  private subscription: Subscription;

  constructor(private notificationService: NotificationService) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    // Optional: Add side effects if needed
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clear() {
    this.notificationService.clear();
  }
}
