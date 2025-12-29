import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DonationService } from '../../services/donation.service';

interface TopDonor {
  id: number;
  name: string;
  email: string;
  totalContributions: number;
  totalAmount: number;
  rank: number;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  topDonors: TopDonor[] = [];
  isLoading = true;
  selectedPeriod = 'all';

  constructor(
    private router: Router,
    private donationService: DonationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.isLoading = true;
    // Mock data for leaderboard
    const mockDonors: TopDonor[] = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        totalContributions: 15,
        totalAmount: 2500,
        rank: 1
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        totalContributions: 12,
        totalAmount: 1800,
        rank: 2
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike@example.com',
        totalContributions: 10,
        totalAmount: 1500,
        rank: 3
      },
      {
        id: 4,
        name: 'Emily Wilson',
        email: 'emily@example.com',
        totalContributions: 8,
        totalAmount: 1200,
        rank: 4
      },
      {
        id: 5,
        name: 'David Brown',
        email: 'david@example.com',
        totalContributions: 6,
        totalAmount: 900,
        rank: 5
      }
    ];

    this.topDonors = mockDonors;
    this.isLoading = false;
  }

  onPeriodChange(): void {
    this.loadLeaderboard();
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return 'emoji_events';
      case 2: return 'workspace_premium';
      case 3: return 'military_tech';
      default: return 'person';
    }
  }

  getRankColor(rank: number): string {
    switch (rank) {
      case 1: return 'warn';
      case 2: return 'accent';
      case 3: return 'primary';
      default: return '';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  browseDonations(): void {
    this.router.navigate(['/donations']);
  }

  goBack(): void {
    this.router.navigate(['/donations']);
  }
}
