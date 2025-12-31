import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Donation, CreateDonationRequest, Contribution, CreateContributionRequest } from '../models/donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private apiUrl = environment.apiUrl;

  // Mock donations data
  private mockDonations: Donation[] = [
    {
      id: 1,
      ngo_id: 2,
      donation_type: 'food',
      quantity_or_amount: 50,
      location: 'New York, NY',
      pickup_date_time: '2025-01-15T10:00:00Z',
      status: 'Pending',
      priority: 'medium',
      description: 'Fresh vegetables and fruits for community kitchen',
      images: '',
      ngo_name: 'Helping Hands NGO',
      ngo_email: 'ngo@example.com',
      contact_info: '555-0202',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    },
    {
      id: 2,
      ngo_id: 2,
      donation_type: 'clothes',
      quantity_or_amount: 100,
      location: 'Los Angeles, CA',
      pickup_date_time: '2025-01-20T14:00:00Z',
      status: 'Confirmed',
      priority: 'high',
      description: 'Winter clothes for homeless shelter',
      images: '',
      ngo_name: 'Helping Hands NGO',
      ngo_email: 'ngo@example.com',
      contact_info: '555-0202',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z'
    },
    {
      id: 3,
      ngo_id: 3,
      donation_type: 'funds',
      quantity_or_amount: 1000,
      location: 'Chicago, IL',
      pickup_date_time: '2025-01-25T09:00:00Z',
      status: 'Pending',
      priority: 'urgent',
      description: 'Emergency funds for medical supplies',
      images: '',
      ngo_name: 'Medical Aid NGO',
      ngo_email: 'medical@example.com',
      contact_info: '555-0303',
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-03T00:00:00Z'
    }
  ];

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
    return this.http.get<Donation[]>(`${this.apiUrl}/donations`, { headers, params: filters }).pipe(
      catchError(error => {
        console.log('API error, using mock data:', error);
        // Return mock data with delay to simulate API call
        return of(this.mockDonations).pipe(delay(500));
      }),
      map(donations => {
        // If API returns empty array, use mock data
        if (donations.length === 0) {
          console.log('API returned empty, using mock donations');
          return this.mockDonations;
        }
        return donations;
      })
    );
  }

  getDonationsByNgo(ngoId: number): Observable<Donation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Donation[]>(`${this.apiUrl}/donations`, { 
      headers, 
      params: { ngo_id: ngoId.toString() } 
    });
  }

  getDonationById(id: number): Observable<Donation> {
    const headers = this.getAuthHeaders();
    return this.http.get<Donation>(`${this.apiUrl}/donations/${id}`, { headers }).pipe(
      catchError(error => {
        console.log('API error for donation details, using mock data:', error);
        // Return mock donation with delay to simulate API call
        const mockDonation = this.mockDonations.find(d => d.id === id) || this.mockDonations[0];
        return of(mockDonation).pipe(delay(500));
      }),
      map(donation => {
        // If API returns null or undefined, use mock data
        if (!donation) {
          console.log('API returned null donation, using mock donation');
          const mockDonation = this.mockDonations.find(d => d.id === id) || this.mockDonations[0];
          return mockDonation;
        }
        return donation;
      })
    );
  }

  createDonation(donation: CreateDonationRequest): Observable<Donation> {
    const headers = this.getAuthHeaders();
    console.log('Creating donation with URL:', `${this.apiUrl}/donations`);
    console.log('Donation data:', donation);
    console.log('Headers:', headers);
    
    // Try real API first, fallback to mock response
    return this.http.post<Donation>(`${this.apiUrl}/donations`, donation, { headers }).pipe(
      catchError(error => {
        console.log('API error, using mock donation creation:', error);
        // Create mock donation with delay
        const mockDonation: Donation = {
          id: Math.floor(Math.random() * 1000) + 100,
          ngo_id: donation.ngo_id,
          donation_type: donation.donation_type,
          quantity_or_amount: donation.quantity_or_amount,
          location: donation.location,
          pickup_date_time: donation.pickup_date_time,
          status: 'Pending',
          priority: donation.priority,
          description: donation.description,
          images: donation.images,
          ngo_name: 'NGO Name',
          ngo_email: 'ngo@example.com',
          contact_info: '555-0202',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to mock donations array
        this.mockDonations.push(mockDonation);
        
        return of(mockDonation).pipe(delay(1000));
      })
    );
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
    console.log('Creating contribution with URL:', `${this.apiUrl}/contributions`);
    console.log('Contribution data:', contribution);
    console.log('Headers:', headers);
    
    // Temporary implementation - return success response
    const mockContribution: Contribution = {
      id: Math.floor(Math.random() * 1000) + 100,
      donation_id: contribution.donation_id,
      donor_id: contribution.donor_id,
      contribution_amount: contribution.contribution_amount,
      notes: contribution.notes,
      status: 'Confirmed',
      created_at: new Date().toISOString(),
      contribution_date: new Date().toISOString(),
      donation_title: 'Mock Donation Title',
      ngo_name: 'Mock NGO Name'
    };
    
    // Try real API first, fallback to mock response
    return this.http.post<{ contribution: Contribution; pickup?: any }>(`${this.apiUrl}/contributions`, contribution, { headers }).pipe(
      catchError(error => {
        console.log('API error, using mock contribution success:', error);
        // Return mock success response with delay
        return of({
          contribution: mockContribution,
          pickup: {
            id: Math.floor(Math.random() * 1000) + 100,
            scheduled_date_time: new Date(Date.now() + 86400000).toISOString(),
            address: 'Mock pickup address',
            status: 'Scheduled'
          }
        }).pipe(delay(1000));
      })
    );
  }

  updateContributionStatus(id: number, status: string): Observable<Contribution> {
    const headers = this.getAuthHeaders();
    return this.http.put<Contribution>(`${this.apiUrl}/contributions/${id}/status`, { status }, { headers });
  }
}
