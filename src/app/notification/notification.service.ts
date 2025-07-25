import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$: Observable<Notification | null> = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' = 'success') {
    this.notificationSubject.next({ message, type });
    // Auto-clear after 3 seconds
    setTimeout(() => this.clear(), 3000);
  }

  clear() {
    this.notificationSubject.next(null);
  }
}
