import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-donation-create',
  templateUrl: './donation-create.component.html',
  styleUrls: ['./donation-create.component.scss']
})
export class DonationCreateComponent implements OnInit {
  donationForm: FormGroup;
  isLoading = false;
  currentUser: any = null;
  
  donationTypes = [
    'food', 'funds', 'clothes', 'education', 'medical', 
    'shelter', 'toys', 'books', 'electronics', 'other'
  ];
  
  priorities = ['urgent', 'high', 'medium', 'low'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
  }

  onSubmit(): void {
    if (this.donationForm.valid) {
      this.isLoading = true;
      
      const donationData = {
        ...this.donationForm.value,
        ngo_id: this.currentUser.id,
        ngo_name: this.currentUser.name,
        status: 'Pending',
        created_at: new Date().toISOString()
      };

      this.donationService.createDonation(donationData).subscribe({
        next: (response) => {
          this.snackBar.open('Donation created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/ngo/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to create donation. Please try again.', 'Close', {
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
