import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

interface UserStats {
  totalContributions: number;
  totalAmount: number;
  rank: number;
}

interface Activity {
  id: number;
  type: 'donation' | 'contribution' | 'achievement';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  userStats: UserStats = {
    totalContributions: 0,
    totalAmount: 0,
    rank: 0
  };
  
  recentActivities: Activity[] = [];
  isEditingProfile = false;
  isChangingPassword = false;
  editProfileForm: any = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.initializeUserData();
    this.loadUserStats();
    this.loadRecentActivities();
  }

  initializeUserData(): void {
    // Initialize edit form with current user data
    this.editProfileForm = {
      name: this.currentUser?.name || 'John Doe',
      email: this.currentUser?.email || 'john.doe@example.com',
      memberSince: this.formatDate(this.currentUser?.created_at) || 'January 2024',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA'
    };
  }

  loadUserStats(): void {
    // In real implementation, this would fetch from API
    // For now, using mock data based on user
    if (this.currentUser?.role === 'Donor') {
      this.userStats = {
        totalContributions: 0,
        totalAmount: 0,
        rank: 0
      };
    } else if (this.currentUser?.role === 'NGO') {
      // For NGO, totalContributions represents donations created
      this.userStats = {
        totalContributions: 0, // This will show "Donations Created"
        totalAmount: 0,
        rank: 0
      };
    }
  }

  loadRecentActivities(): void {
    // Limit to 1 record as requested
    if (this.currentUser?.role === 'Donor') {
      this.recentActivities = [
        {
          id: 1,
          type: 'achievement',
          title: 'Welcome to Charity Portal!',
          description: 'Your account has been successfully created. Start contributing to make a difference!',
          timestamp: this.currentUser?.created_at || new Date().toISOString()
        }
      ];
    } else if (this.currentUser?.role === 'NGO') {
      this.recentActivities = [
        {
          id: 1,
          type: 'achievement',
          title: 'NGO Account Created',
          description: 'Your organization is now verified. Start creating donation requests!',
          timestamp: this.currentUser?.created_at || new Date().toISOString()
        }
      ];
    }
  }

  editProfile(): void {
    if (this.isEditingProfile) {
      // Save the profile
      this.saveProfile();
    } else {
      // Enable editing
      this.isEditingProfile = true;
    }
  }

  saveProfile(): void {
    // In real implementation, this would call API to update profile
    // For now, just show success message and update local data
    this.currentUser.name = this.editProfileForm.name;
    this.currentUser.email = this.editProfileForm.email;
    this.currentUser.memberSince = this.editProfileForm.memberSince;
    this.currentUser.phone = this.editProfileForm.phone;
    this.currentUser.location = this.editProfileForm.location;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(this.currentUser));
    
    this.isEditingProfile = false;
    this.snackBar.open('Profile updated successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  cancelEdit(): void {
    this.isEditingProfile = false;
    this.initializeUserData(); // Reset form data
  }

  changePassword(): void {
    this.snackBar.open(`Password reset link will be sent to: ${this.currentUser?.email}`, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  viewAllActivity(): void {
    this.snackBar.open('Full activity history will be available soon!', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'donation': return 'volunteer_activism';
      case 'contribution': return 'favorite';
      case 'achievement': return 'emoji_events';
      default: return 'activity';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'January 2024';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
