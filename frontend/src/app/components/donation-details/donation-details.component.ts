import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-donation-details',
  templateUrl: './donation-details.component.html',
  styleUrls: ['./donation-details.component.scss']
})
export class DonationDetailsComponent implements OnInit {
  donation: Donation | null = null;
  isLoading = true;
  donationId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private donationService: DonationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.donationId = +params['id'];
      this.loadDonationDetails();
    });
  }

  loadDonationDetails(): void {
    this.isLoading = true;
    this.donationService.getDonationById(this.donationId).subscribe({
      next: (donation) => {
        this.donation = donation;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load donation details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/donations']);
      }
    });
  }

  contributeToDonation(): void {
    if (this.donation) {
      this.router.navigate(['/donations', this.donation.id, 'contribute']);
    }
  }

  goBack(): void {
    this.router.navigate(['/donations']);
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

  isContributionAllowed(): boolean {
    if (!this.donation) return false;
    return this.donation.status !== 'Completed' && this.donation.status !== 'Cancelled';
  }
}
