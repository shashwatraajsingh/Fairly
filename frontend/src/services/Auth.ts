import type { User } from '../types/auth';

class AuthService {
  async login(email: string, password: string): Promise<User> {
    try {
      // Mock implementation - replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      // Mock implementation - replace with actual Google OAuth
      console.log('Google login initiated');
      
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: '1',
            email: 'user@gmail.com',
            name: 'SINGH',
            createdAt: new Date()
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Google login failed');
    }
  }

  async loginWithPhone(phone: string, otp: string): Promise<User> {
    try {
      // Mock implementation - replace with actual phone auth
      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Phone login error:', error);
      throw new Error('Phone login failed');
    }
  }

  async register(userData: { email: string; password: string; name: string; phone?: string }): Promise<User> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
