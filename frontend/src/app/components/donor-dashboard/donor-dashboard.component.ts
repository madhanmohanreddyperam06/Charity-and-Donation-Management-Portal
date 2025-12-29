import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Contribution } from '../../models/donation.model';

@Component({
  selector: 'app-donor-dashboard',
  templateUrl: './donor-dashboard.component.html',
  styleUrls: ['./donor-dashboard.component.scss']
})
export class DonorDashboardComponent implements OnInit {
  myContributions: Contribution[] = [];
  isLoading = true;
  currentUser: any = null;
  stats = {
    totalContributions: 0,
    totalAmount: 0,
    pendingContributions: 0,
    completedContributions: 0
  };

  constructor(
    private router: Router,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'Donor') {
      this.router.navigate(['/login']);
      return;
    }
    this.loadMyContributions();
  }

  loadMyContributions(): void {
    this.isLoading = true;
    this.donationService.getDonorContributions(this.currentUser.id).subscribe({
      next: (contributions) => {
        this.myContributions = contributions;
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load contributions', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  calculateStats(): void {
    this.stats.totalContributions = this.myContributions.length;
    this.stats.totalAmount = this.myContributions.reduce((sum, c) => sum + c.contribution_amount, 0);
    this.stats.pendingContributions = this.myContributions.filter(c => c.status === 'Pending').length;
    this.stats.completedContributions = this.myContributions.filter(c => c.status === 'Completed').length;
  }

  browseDonations(): void {
    this.router.navigate(['/donations']);
  }

  viewDonationDetails(donationId: number): void {
    this.router.navigate(['/donations', donationId]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'warn';
      case 'Confirmed': return 'accent';
      case 'Completed': return 'primary';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
