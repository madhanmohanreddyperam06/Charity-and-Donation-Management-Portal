import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-ngo-dashboard',
  templateUrl: './ngo-dashboard.component.html',
  styleUrls: ['./ngo-dashboard.component.scss']
})
export class NgoDashboardComponent implements OnInit {
  myDonations: Donation[] = [];
  isLoading = true;
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
    private snackBar: MatSnackBar
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
    this.isLoading = true;
    // Mock data for now - in real implementation, filter by NGO ID
    const mockDonations: Donation[] = [
      {
        id: 1,
        ngo_id: this.currentUser.id,
        donation_type: 'food',
        quantity_or_amount: 100,
        location: 'New York',
        pickup_date_time: '2024-01-15T10:00:00Z',
        status: 'Pending',
        priority: 'medium',
        description: 'Food items for homeless shelter',
        ngo_name: this.currentUser.name,
        created_at: new Date().toISOString()
      }
    ];

    this.myDonations = mockDonations;
    this.calculateStats();
    this.isLoading = false;
  }

  calculateStats(): void {
    this.stats.totalDonations = this.myDonations.length;
    this.stats.pendingDonations = this.myDonations.filter(d => d.status === 'Pending').length;
    this.stats.confirmedDonations = this.myDonations.filter(d => d.status === 'Confirmed').length;
    this.stats.completedDonations = this.myDonations.filter(d => d.status === 'Completed').length;
  }

  createNewDonation(): void {
    this.router.navigate(['/donations/create']);
  }

  viewDonationDetails(id: number): void {
    this.router.navigate(['/donations', id]);
  }

  editDonation(id: number): void {
    this.router.navigate(['/donations', id, 'edit']);
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
