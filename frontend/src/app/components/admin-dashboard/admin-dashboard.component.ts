import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { DonationService } from '../../services/donation.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  isLoading = true;
  private refreshSubscription: Subscription | null = null;
  
  stats = {
    totalUsers: 0,
    totalDonations: 0,
    totalContributions: 0,
    pendingDonations: 0,
    completedDonations: 0,
    totalAmount: 0
  };

  recentUsers: any[] = [];
  recentDonations: any[] = [];
  topContributors: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private donationService: DonationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'Admin') {
      this.snackBar.open('Access denied. Admin role required.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/login']);
      return;
    }
    this.loadDashboardData();
    // Set up real-time refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load donations data
    this.donationService.getDonations().subscribe({
      next: (donations) => {
        this.recentDonations = donations.slice(0, 10).map(d => ({
          id: d.id,
          title: d.description || `${d.donation_type} donation`,
          ngo_name: d.ngo_name || 'Unknown NGO',
          status: d.status,
          created_at: d.created_at,
          ngo_id: d.ngo_id
        }));
        
        // Calculate stats
        this.stats.totalDonations = donations.length;
        this.stats.pendingDonations = donations.filter(d => d.status === 'Pending').length;
        this.stats.completedDonations = donations.filter(d => d.status === 'Completed').length;
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load donation data', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
    
    // Mock other data for now
    this.stats.totalUsers = 150;
    this.stats.totalContributions = 320;
    this.stats.totalAmount = 15420;

    this.recentUsers = [
      { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Donor', created_at: new Date().toISOString() },
      { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'NGO', created_at: new Date().toISOString() },
      { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'Donor', created_at: new Date().toISOString() }
    ];

    this.topContributors = [
      { name: 'John Smith', contributions: 15, amount: 2500 },
      { name: 'Sarah Johnson', contributions: 12, amount: 1800 },
      { name: 'Mike Davis', contributions: 10, amount: 1500 }
    ];
  }

  viewAllUsers(): void {
    this.snackBar.open('User management feature coming soon!', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  viewAllDonations(): void {
    this.router.navigate(['/donations']);
  }

  viewDonationDetails(donationId: number): void {
    this.router.navigate(['/donations', donationId]);
  }

  editDonation(donationId: number): void {
    this.router.navigate(['/donations', donationId, 'edit']);
  }

  deleteDonation(donationId: number): void {
    if (confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      this.donationService.cancelDonation(donationId).subscribe({
        next: () => {
          this.snackBar.open('Donation deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadDashboardData();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete donation', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  viewReports(): void {
    this.snackBar.open('Reports and analytics feature coming soon!', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  manageSettings(): void {
    this.snackBar.open('System settings feature coming soon!', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin': return 'warn';
      case 'NGO': return 'accent';
      case 'Donor': return 'primary';
      default: return '';
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
}
