import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation } from '../../models/donation.model';

@Component({
  selector: 'app-donation-edit',
  templateUrl: './donation-edit.component.html',
  styleUrls: ['./donation-edit.component.scss']
})
export class DonationEditComponent implements OnInit {
  donationForm: FormGroup;
  isLoading = false;
  currentUser: any = null;
  donationId: number = 0;
  originalDonation: Donation | null = null;
  
  donationTypes = [
    'food', 'funds', 'clothes', 'education', 'medical', 
    'shelter', 'toys', 'books', 'electronics', 'other'
  ];
  
  priorities = ['urgent', 'high', 'medium', 'low'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.donationForm = this.fb.group({
      donation_type: ['', Validators.required],
      quantity_or_amount: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      pickup_date_time: ['', Validators.required],
      priority: ['medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'NGO') {
      this.snackBar.open('Access denied. NGO role required.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/ngo/dashboard']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    this.donationId = idParam ? +idParam : 0;
    if (this.donationId === 0 || isNaN(this.donationId)) {
      this.snackBar.open('Invalid donation ID', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/ngo/dashboard']);
      return;
    }

    this.loadDonation();
  }

  loadDonation(): void {
    this.isLoading = true;
    this.donationService.getDonationById(this.donationId).subscribe({
      next: (donation: Donation) => {
        if (donation.ngo_id !== this.currentUser.id) {
          this.snackBar.open('You can only edit your own donations', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/ngo/dashboard']);
          return;
        }

        if (donation.status !== 'Pending') {
          this.snackBar.open('Only pending donations can be edited', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/ngo/dashboard']);
          return;
        }

        this.originalDonation = donation;
        this.donationForm.patchValue({
          donation_type: donation.donation_type,
          quantity_or_amount: donation.quantity_or_amount,
          location: donation.location,
          pickup_date_time: donation.pickup_date_time,
          priority: donation.priority,
          description: donation.description
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load donation details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/ngo/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.donationForm.valid && this.originalDonation) {
      this.isLoading = true;
      
      const donationData = {
        ...this.originalDonation,
        ...this.donationForm.value
      };

      this.donationService.updateDonation(this.donationId, donationData).subscribe({
        next: (response) => {
          this.snackBar.open('Donation updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/ngo/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to update donation. Please try again.', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/ngo/dashboard']);
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
}
