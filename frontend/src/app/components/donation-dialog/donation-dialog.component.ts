import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';
import { AuthService } from '../../services/auth.service';

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
        quantity_or_amount: this.data.donation.quantity_or_amount,
        location: this.data.donation.location,
        pickup_date_time: this.data.donation.pickup_date_time,
        priority: this.data.donation.priority,
        description: this.data.donation.description
      });
    }
  }

  onSubmit(): void {
    console.log('Form submitted:', this.donationForm.value);
    console.log('Form valid:', this.donationForm.valid);
    console.log('Current user:', this.currentUser);
    
    if (this.donationForm.valid) {
      this.isLoading = true;
      
      const donationData = {
        ...this.donationForm.value,
        ngo_id: this.currentUser.id,
        ngo_name: this.currentUser.name,
        ngo_email: this.currentUser.email || 'ngo@example.com',
        contact_info: this.currentUser.contact_info || '555-0123',
        status: 'Pending',
        created_at: new Date().toISOString()
      };

      console.log('Donation data to send:', donationData);

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
