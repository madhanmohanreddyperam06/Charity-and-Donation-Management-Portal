import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  getDashboardRoute(): string {
    if (this.currentUser?.role === 'Admin') {
      return '/admin/dashboard';
    } else if (this.currentUser?.role === 'NGO') {
      return '/ngo/dashboard';
    } else if (this.currentUser?.role === 'Donor') {
      return '/donor/dashboard';
    } else {
      return '/donations';
    }
  }

  logout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Navigate to landing page
    this.router.navigate(['/']);
  }
}
