import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation } from '../../models/donation.model';
import { DonationDialogComponent, DonationDialogData } from '../donation-dialog/donation-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-ngo-dashboard',
  templateUrl: './ngo-dashboard.component.html',
  styleUrls: ['./ngo-dashboard.component.scss']
})
export class NgoDashboardComponent implements OnInit {
  myDonations: Donation[] = [];
  isLoading = false;
  currentUser: any = null;
  stats = {
    totalDonations: 0,
    pendingDonations: 0,
    confirmedDonations: 0,
    completedDonations: 0
  };

  constructor(
    private router: Router,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'NGO') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMyDonations();
  }

  loadMyDonations(): void {
    this.donationService.getDonationsByNgo(this.currentUser.id).subscribe({
      next: (donations) => {
        console.log('NGO Donations loaded:', donations);
        this.myDonations = donations;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading NGO donations:', error);
        this.snackBar.open('Failed to load donations. Please try again.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  calculateStats(): void {
    this.stats.totalDonations = this.myDonations.length;
    this.stats.pendingDonations = this.myDonations.filter(d => d.status === 'Pending').length;
    this.stats.confirmedDonations = this.myDonations.filter(d => d.status === 'Confirmed').length;
    this.stats.completedDonations = this.myDonations.filter(d => d.status === 'Completed').length;
  }

  createNewDonation(): void {
    const dialogRef = this.dialog.open(DonationDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog closed with result:', result);
        // Add to new donation to list immediately
        if (result.id) {
          this.myDonations.unshift(result);
          this.calculateStats();
          
          // Send notification to all donors about new donation
          this.notificationService.addDonationCreatedNotification(
            this.currentUser.name,
            result.description || `${result.donation_type} donation`,
            result.id
          );
        }
        // Also refresh from server to get latest data
        this.loadMyDonations();
      }
    });
  }

  viewDonationDetails(id: number): void {
    this.router.navigate(['/donations', id]);
  }

  editDonation(id: number): void {
    const donation = this.myDonations.find(d => d.id === id);
    if (!donation) {
      this.snackBar.open('Donation not found', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Only allow editing pending donations
    if (donation.status !== 'Pending') {
      this.snackBar.open('Only pending donations can be edited', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(DonationDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { mode: 'edit', donation: donation },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh donations list to show the updated donation
        this.loadMyDonations();
      }
    });
  }

  cancelDonation(id: number): void {
    if (confirm('Are you sure you want to cancel this donation?')) {
      this.donationService.cancelDonation(id).subscribe({
        next: () => {
          this.snackBar.open('Donation cancelled successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadMyDonations();
        },
        error: (error) => {
          this.snackBar.open('Failed to cancel donation', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'warn';
      case 'Confirmed': return 'accent';
      case 'Completed': return 'primary';
      case 'Cancelled': return '';
      default: return '';
    }
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'urgent': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      case 'low': return '';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getDonationTypeIcon(type: string): string {
    switch (type) {
      case 'food': return 'restaurant';
      case 'funds': return 'attach_money';
      case 'clothes': return 'checkroom';
      case 'education': return 'school';
      case 'medical': return 'medical_services';
      case 'shelter': return 'home';
      case 'toys': return 'toys';
      case 'books': return 'menu_book';
      case 'electronics': return 'devices';
      default: return 'inventory_2';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
