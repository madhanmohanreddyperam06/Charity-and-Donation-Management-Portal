export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Donor' | 'NGO' | 'Admin';
  contact_info?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'Donor' | 'NGO' | 'Admin';
  contact_info?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
