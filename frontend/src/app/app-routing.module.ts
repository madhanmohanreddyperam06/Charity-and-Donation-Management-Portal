import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DonationListComponent } from './components/donation-list/donation-list.component';
import { DonationDetailsComponent } from './components/donation-details/donation-details.component';
import { ContributionComponent } from './components/contribution/contribution.component';
import { NgoDashboardComponent } from './components/ngo-dashboard/ngo-dashboard.component';
import { DonorDashboardComponent } from './components/donor-dashboard/donor-dashboard.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { LandingComponent } from './components/landing/landing.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'donations', component: DonationListComponent, canActivate: [AuthGuard] },
  { path: 'donations/:id', component: DonationDetailsComponent, canActivate: [AuthGuard] },
  { path: 'donations/:id/contribute', component: ContributionComponent, canActivate: [AuthGuard] },
  { path: 'ngo/dashboard', component: NgoDashboardComponent, canActivate: [AuthGuard] },
  { path: 'donor/dashboard', component: DonorDashboardComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
