import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-donation-list',
  templateUrl: './donation-list.component.html',
  styleUrls: ['./donation-list.component.scss']
})
export class DonationListComponent implements OnInit {
  donations: Donation[] = [];
  filteredDonations: Donation[] = [];
  isLoading = true;
  
  // Filter options
  donationTypes = ['food', 'funds', 'clothes', 'education', 'medical', 'shelter', 'toys', 'books', 'electronics', 'other'];
  statuses = ['Pending', 'Confirmed', 'Completed'];
  
  filters = {
    donation_type: '',
    location: '',
    status: '',
    date_from: '',
    date_to: ''
  };

  constructor(
    private donationService: DonationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDonations();
  }

  loadDonations(): void {
    this.isLoading = true;
    this.donationService.getDonations(this.filters).subscribe({
      next: (donations) => {
        this.donations = donations;
        this.filteredDonations = donations;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load donations', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilters(): void {
    this.loadDonations();
  }

  clearFilters(): void {
    this.filters = {
      donation_type: '',
      location: '',
      status: '',
      date_from: '',
      date_to: ''
    };
    this.loadDonations();
  }

  viewDonationDetails(id: number): void {
    this.router.navigate(['/donations', id]);
  }

  contributeToDonation(id: number): void {
    this.router.navigate(['/donations', id, 'contribute']);
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
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
