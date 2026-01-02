import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { Donation, CreateContributionRequest } from '../../models/donation.model';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.scss']
})
export class ContributionComponent implements OnInit {
  donation: Donation | null = null;
  contributionForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  donationId: number = 0;
  currentUser: any = null;
  selectedPaymentMethod: string = '';
  showPaymentDetails: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.contributionForm = this.fb.group({
      contribution_amount: ['', [Validators.required, Validators.min(1)]],
      payment_method: ['', Validators.required],
      notes: [''],
      scheduled_pickup_date_time: [''],
      pickup_address: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

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

  onSubmit(): void {
    if (this.contributionForm.valid && this.donation && this.currentUser) {
      this.isSubmitting = true;
      
      const contributionData: CreateContributionRequest = {
        donation_id: this.donationId,
        donor_id: this.currentUser.id,
        contribution_amount: this.contributionForm.value.contribution_amount,
        notes: this.contributionForm.value.notes,
        scheduled_pickup_date_time: this.contributionForm.value.scheduled_pickup_date_time,
        pickup_address: this.contributionForm.value.pickup_address
      };

      this.donationService.createContribution(contributionData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.snackBar.open('Contribution submitted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/donor/dashboard']);
        },
        error: (error) => {
          console.error('Error creating contribution:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error details:', error.error);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          
          this.isSubmitting = false;
          
          // Show specific error message to user
          let errorMessage = error.error?.error || 'Failed to submit contribution';
          
          if (error.status === 400) {
            errorMessage = error.error?.error || 'Invalid contribution data. Please check all required fields.';
          } else if (error.status === 401) {
            errorMessage = 'Authentication error. Please login again.';
          } else if (error.status === 403) {
            errorMessage = 'Permission denied. Only donors can submit contributions.';
          } else if (error.status === 404) {
            errorMessage = 'Donation not found.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          }
          
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onPaymentMethodChange(event: any): void {
    this.selectedPaymentMethod = event.value;
    this.showPaymentDetails = !!event.value;
  }

  onQrImageError(event: any): void {
    console.log('QR image failed to load, showing fallback');
    // You could show a fallback QR or error message here
    event.target.style.display = 'none';
  }

  goBack(): void {
    this.router.navigate(['/donations', this.donationId]);
  }

  requiresPickup(): boolean {
    return this.donation?.donation_type !== 'funds';
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

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}
