import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  notificationCount = 0;
  isOpen = false;
  currentUser: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to notifications based on user role
    if (this.currentUser?.role === 'Donor') {
      this.notificationService.notifications$
        .pipe(takeUntil(this.destroy$))
        .subscribe(allNotifications => {
          this.notifications = this.notificationService.getNotificationsForRole('Donor');
          this.notificationCount = this.notifications.filter(n => !n.read).length;
        });
    } else if (this.currentUser?.role === 'NGO') {
      this.notificationService.notifications$
        .pipe(takeUntil(this.destroy$))
        .subscribe(allNotifications => {
          this.notifications = this.notificationService.getNotificationsForRole('NGO');
          this.notificationCount = this.notifications.filter(n => !n.read).length;
        });
    }
    
    // Subscribe to notification count
    this.notificationService.notificationCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.notificationCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearNotifications();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'donation_created': return 'volunteer_activism';
      case 'contribution_received': return 'favorite';
      default: return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'donation_created': return 'primary';
      case 'contribution_received': return 'accent';
      default: return 'primary';
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  onBackdropClick(): void {
    this.isOpen = false;
  }
}
