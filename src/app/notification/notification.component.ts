import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notification" class="toast-container" [@toastState]="'visible'">
      <div class="toast" [ngClass]="notification.type">
        {{ notification.message }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    .toast {
      padding: 15px 25px;
      border-radius: 12px;
      color: white;
      font-weight: 500;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .toast.success {
      background-color: #28a745;
    }
    .toast.error {
      background-color: #dc3545;
    }
  `],
  animations: [
    trigger('toastState', [
      state('void', style({
        transform: 'translateY(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => visible', animate('300ms ease-out')),
      transition('visible => void', animate('300ms ease-in'))
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notification: Notification | null = null;
  private subscription: Subscription | undefined;
  private timer: any;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.subscription = this.notificationService.notification$.subscribe(notification => {
      this.notification = notification;
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (notification) {
        this.timer = setTimeout(() => {
          this.notificationService.clear();
        }, 3000); // Notification disappears after 3 seconds
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
