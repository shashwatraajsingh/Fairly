export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PhoneLoginData {
  phone: string;
  otp: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}
