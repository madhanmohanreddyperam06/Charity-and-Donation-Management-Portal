import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'donation_created' | 'contribution_received';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  fromUser?: string;
  fromUserRole?: string;
  donationId?: number;
  contributionId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  private notificationCount = new BehaviorSubject<number>(0);

  // Observable for components to subscribe to
  notifications$: Observable<Notification[]>;
  notificationCount$: Observable<number>;

  constructor() {
    this.notifications$ = this.notifications.asObservable();
    this.notificationCount$ = this.notificationCount.asObservable();
  }

  // Get current notifications
  getNotifications(): Notification[] {
    return this.notifications.value;
  }

  // Get current notification count
  getNotificationCount(): number {
    return this.notificationCount.value;
  }

  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([newNotification, ...currentNotifications]);
    this.updateNotificationCount();
  }

  // Add notification for donation creation (NGO → Donor)
  addDonationCreatedNotification(ngoName: string, donationDescription: string, donationId: number): void {
    this.addNotification({
      type: 'donation_created',
      title: 'New Donation Available',
      message: `${ngoName} created a new donation: ${donationDescription}`,
      fromUser: ngoName,
      fromUserRole: 'NGO',
      donationId
    });
  }

  // Add notification for contribution (Donor → NGO)
  addContributionReceivedNotification(donorName: string, donationDescription: string, contributionId?: number): void {
    this.addNotification({
      type: 'contribution_received',
      title: 'New Contribution Received',
      message: `${donorName} contributed to your donation: ${donationDescription}`,
      fromUser: donorName,
      fromUserRole: 'Donor',
      contributionId
    });
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notifications.next(updatedNotifications);
    this.updateNotificationCount();
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    const currentNotifications = this.notifications.value;
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.notifications.next(updatedNotifications);
    this.updateNotificationCount();
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notifications.next([]);
    this.notificationCount.next(0);
  }

  // Update notification count (unread notifications)
  private updateNotificationCount(): void {
    const unreadCount = this.notifications.value.filter(n => !n.read).length;
    this.notificationCount.next(unreadCount);
  }

  // Get notifications for specific user role
  getNotificationsForRole(role: string): Notification[] {
    const allNotifications = this.notifications.value;
    
    if (role === 'Donor') {
      // Donors see donation creation notifications
      return allNotifications.filter(n => n.type === 'donation_created');
    } else if (role === 'NGO') {
      // NGOs see contribution notifications
      return allNotifications.filter(n => n.type === 'contribution_received');
    }
    
    return [];
  }
}
