export interface Donation {
  id: number;
  ngo_id: number;
  donation_type: 'food' | 'funds' | 'clothes' | 'other';
  quantity_or_amount: number;
  location: string;
  pickup_date_time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  images?: string;
  ngo_name?: string;
  ngo_email?: string;
  contact_info?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateDonationRequest {
  ngo_id: number;
  donation_type: 'food' | 'funds' | 'clothes' | 'other';
  quantity_or_amount: number;
  location: string;
  pickup_date_time: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  images?: string;
}

export interface Contribution {
  id: number;
  donation_id: number;
  donor_id: number;
  contribution_amount: number;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  created_at: string;
  contribution_date?: string;
  donation_title?: string;
  ngo_name?: string;
  donation?: {
    id: number;
    donation_type: string;
    location: string;
    ngo_name: string;
  };
  donor?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateContributionRequest {
  donation_id: number;
  donor_id: number;
  contribution_amount: number;
  notes?: string;
  scheduled_pickup_date_time?: string;
  pickup_address?: string;
}
