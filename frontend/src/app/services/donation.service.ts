import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donation, CreateDonationRequest, Contribution, CreateContributionRequest } from '../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`,
      'Content-Type': 'application/json'
    });
  }

  // Donation methods
  getDonations(filters?: any): Observable<Donation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Donation[]>(`${this.apiUrl}/donations`, { headers, params: filters });
  }

  getDonationById(id: number): Observable<Donation> {
    const headers = this.getAuthHeaders();
    return this.http.get<Donation>(`${this.apiUrl}/donations/${id}`, { headers });
  }

  createDonation(donation: CreateDonationRequest): Observable<Donation> {
    const headers = this.getAuthHeaders();
    return this.http.post<Donation>(`${this.apiUrl}/donations`, donation, { headers });
  }

  updateDonation(id: number, updates: Partial<Donation>): Observable<Donation> {
    const headers = this.getAuthHeaders();
    return this.http.put<Donation>(`${this.apiUrl}/donations/${id}`, updates, { headers });
  }

  cancelDonation(id: number): Observable<Donation> {
    const headers = this.getAuthHeaders();
    return this.http.delete<Donation>(`${this.apiUrl}/donations/${id}`, { headers });
  }

  // Contribution methods
  getDonorContributions(donorId: number): Observable<Contribution[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Contribution[]>(`${this.apiUrl}/contributions/donor/${donorId}`, { headers });
  }

  getDonationContributions(donationId: number): Observable<Contribution[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Contribution[]>(`${this.apiUrl}/contributions/donation/${donationId}`, { headers });
  }

  createContribution(contribution: CreateContributionRequest): Observable<{ contribution: Contribution; pickup?: any }> {
    const headers = this.getAuthHeaders();
    return this.http.post<{ contribution: Contribution; pickup?: any }>(`${this.apiUrl}/contributions`, contribution, { headers });
  }

  updateContributionStatus(id: number, status: string): Observable<Contribution> {
    const headers = this.getAuthHeaders();
    return this.http.put<Contribution>(`${this.apiUrl}/contributions/${id}/status`, { status }, { headers });
  }
}
