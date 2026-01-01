import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';
import { CreateDonationRequest } from '../../models/donation.model';

export interface DonationDialogData {
  mode: 'create' | 'edit';
  donation?: any;
}

@Component({
  selector: 'app-donation-dialog',
  templateUrl: './donation-dialog.component.html',
  styleUrls: ['./donation-dialog.component.scss']
})
export class DonationDialogComponent implements OnInit {
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
    private dialogRef: MatDialogRef<DonationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DonationDialogData,
    private donationService: DonationService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.donationForm = this.fb.group({
      donation_type: ['', Validators.required],
      ngo_name: ['', Validators.required],
      quantity_or_amount: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      pickup_date_time: ['', Validators.required],
      priority: ['medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.data.mode === 'edit' && this.data.donation) {
      this.donationForm.patchValue({
        donation_type: this.data.donation.donation_type,
        ngo_name: this.data.donation.ngo_name,
        quantity_or_amount: this.data.donation.quantity_or_amount,
        location: this.data.donation.location,
        pickup_date_time: this.data.donation.pickup_date_time,
        priority: this.data.donation.priority,
        description: this.data.donation.description
      });
    } else if (this.data.mode === 'create') {
      // Pre-fill NGO name if available from current user
      if (this.currentUser?.name) {
        this.donationForm.patchValue({
          ngo_name: this.currentUser.name
        });
      }
    }
  }

  onSubmit(): void {
    console.log('Form submitted:', this.donationForm.value);
    console.log('Form valid:', this.donationForm.valid);
    console.log('Form errors:', this.donationForm.errors);
    console.log('Current user:', this.currentUser);
    
    // Check each required field individually
    const formValue = this.donationForm.value;
    console.log('Individual fields:');
    console.log('- donation_type:', formValue.donation_type);
    console.log('- ngo_name:', formValue.ngo_name);
    console.log('- quantity_or_amount:', formValue.quantity_or_amount);
    console.log('- location:', formValue.location);
    console.log('- pickup_date_time:', formValue.pickup_date_time);
    console.log('- priority:', formValue.priority);
    console.log('- description:', formValue.description);
    
    if (this.donationForm.valid) {
      this.isLoading = true;
      
      // Ensure all required fields are properly formatted
      const donationData: CreateDonationRequest = {
        ngo_id: this.currentUser.id,
        donation_type: formValue.donation_type?.trim() || 'food',
        ngo_name: formValue.ngo_name?.trim() || '',
        quantity_or_amount: parseFloat(formValue.quantity_or_amount) || 0,
        location: formValue.location?.trim() || '',
        pickup_date_time: formValue.pickup_date_time || '',
        priority: formValue.priority || 'medium',
        description: formValue.description?.trim() || '',
        images: undefined
      };

      console.log('Donation data to send:', donationData);
      console.log('Required fields check:');
      console.log('- ngo_id:', donationData.ngo_id);
      console.log('- donation_type:', donationData.donation_type);
      console.log('- quantity_or_amount:', donationData.quantity_or_amount);
      console.log('- location:', donationData.location);
      console.log('- pickup_date_time:', donationData.pickup_date_time);

      if (this.data.mode === 'create') {
        this.donationService.createDonation(donationData).subscribe({
          next: (response) => {
            console.log('Donation created successfully:', response);
            this.snackBar.open('Donation created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error creating donation:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            this.isLoading = false;
            
            // Show specific error message to user
            let errorMessage = 'Failed to create donation. Please try again.';
            
            if (error.status === 400) {
              errorMessage = error.error?.error || 'Invalid donation data. Please check all required fields.';
            } else if (error.status === 401) {
              errorMessage = 'Authentication error. Please login again.';
            } else if (error.status === 403) {
              errorMessage = 'Permission denied. Only NGOs can create donations.';
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } else if (this.data.mode === 'edit') {
        this.donationService.updateDonation(this.data.donation.id, donationData).subscribe({
          next: (response) => {
            console.log('Donation updated successfully:', response);
            this.snackBar.open('Donation updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error updating donation:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            
            this.isLoading = false;
            
            // Show specific error message to user
            let errorMessage = 'Failed to update donation. Please try again.';
            
            if (error.status === 400) {
              errorMessage = error.error?.error || 'Invalid donation data. Please check all required fields.';
            } else if (error.status === 401) {
              errorMessage = 'Authentication error. Please login again.';
            } else if (error.status === 403) {
              errorMessage = 'Permission denied. You can only edit your own donations.';
            } else if (error.status === 404) {
              errorMessage = 'Donation not found.';
            } else if (error.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            this.snackBar.open(errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    } else {
      console.log('Form is invalid, marking all fields as touched');
      Object.keys(this.donationForm.controls).forEach(key => {
        this.donationForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
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

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'urgent': return 'warning';
      case 'high': return 'keyboard_arrow_up';
      case 'medium': return 'remove';
      case 'low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return 'warn';
      case 'high': return 'accent';
      case 'medium': return 'primary';
      case 'low': return '';
      default: return '';
    }
  }
}
