import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true, // Make component standalone
  imports: [CommonModule], // Import CommonModule for *ngIf
  template: `
    <div *ngIf="message" class="notification show">
      {{ message }}
    </div>
  `,
  styles: [`
    .notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #333;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.5s, visibility 0.5s, transform 0.5s;
    }
    .notification.show {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  message: string | null = null;
  private subscription!: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Subscribe to notification messages from the service
    this.subscription = this.notificationService.notification$.subscribe(
      (message) => {
        this.message = message;
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
