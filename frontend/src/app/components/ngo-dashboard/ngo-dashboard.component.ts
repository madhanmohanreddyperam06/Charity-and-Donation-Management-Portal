import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation, Contribution } from '../../models/donation.model';
import { DonationDialogComponent, DonationDialogData } from '../donation-dialog/donation-dialog.component';
import { ContributionDetailsDialogComponent } from '../contribution-details-dialog/contribution-details-dialog.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-ngo-dashboard',
  templateUrl: './ngo-dashboard.component.html',
  styleUrls: ['./ngo-dashboard.component.scss']
})
export class NgoDashboardComponent implements OnInit {
  myDonations: Donation[] = [];
  receivedContributions: Contribution[] = [];
  isLoading = false;
  currentUser: any = null;
  stats = {
    totalDonations: 0,
    pendingDonations: 0,
    confirmedDonations: 0,
    completedDonations: 0
  };
  contributionStats = {
    totalContributions: 0,
    totalAmount: 0,
    pendingContributions: 0,
    confirmedContributions: 0
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
    this.loadReceivedContributions();
    
    // Set up real-time updates
    setInterval(() => {
      this.loadMyDonations();
      this.loadReceivedContributions();
    }, 30000); // Refresh every 30 seconds
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
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Donation created:', result);
        // Refresh donations to show the new one
        this.loadMyDonations();
        
        this.snackBar.open('Donation created successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  loadReceivedContributions(): void {
    // Mock contributions data for NGO dashboard - reduced to 1 contribution
    this.receivedContributions = [
      {
        id: 101,
        donation_id: 3,
        donor_id: 1,
        contribution_amount: 500,
        notes: 'Happy to contribute to this emergency medical fund!',
        status: 'Confirmed',
        created_at: '2025-01-10T10:30:00Z',
        contribution_date: '2025-01-10T10:30:00Z',
        donation_title: 'Emergency funds for medical supplies',
        ngo_name: 'Medical Aid NGO',
        donor: {
          id: 1,
          name: 'John Doe',
          email: 'donor@example.com'
        }
      }
    ];
    
    this.calculateContributionStats();
  }

  calculateContributionStats(): void {
    this.contributionStats.totalContributions = this.receivedContributions.length;
    this.contributionStats.totalAmount = this.receivedContributions.reduce((sum, c) => sum + c.contribution_amount, 0);
    this.contributionStats.pendingContributions = this.receivedContributions.filter(c => c.status === 'Pending').length;
    this.contributionStats.confirmedContributions = this.receivedContributions.filter(c => c.status === 'Confirmed').length;
  }

  viewContributionDetails(contributionId: number): void {
    // Find the contribution from received contributions
    const contribution = this.receivedContributions.find(c => c.id === contributionId);
    if (contribution) {
      // Create a simple popup with contribution details
      this.dialog.open(ContributionDetailsDialogComponent, {
        width: '500px',
        data: { contribution }
      });
    }
  }

  updateContributionStatus(contributionId: number, status: string): void {
    // Find the contribution and update its status
    const contribution = this.receivedContributions.find(c => c.id === contributionId);
    if (contribution) {
      contribution.status = status as 'Pending' | 'Confirmed' | 'Completed';
      this.calculateContributionStats();
      
      this.snackBar.open(`Contribution ${status.toLowerCase()} successfully!`, 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
