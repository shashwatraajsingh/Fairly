import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register with email and password
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
      authProvider: 'email'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login with email and password
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Google authentication
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'ID token is required' });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email });
      
      if (user) {
        // Link existing account with Google
        user.firebaseUid = uid;
        user.authProvider = 'google';
        if (picture) user.avatar = picture;
        await user.save();
      } else {
        // Create new user
        user = new User({
          email,
          name: name || 'SINGH',
          firebaseUid: uid,
          authProvider: 'google',
          avatar: picture,
          isEmailVerified: true
        });
        await user.save();
      }
    }

    // Generate our own JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Google authentication successful',
      token,
      user
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

// Phone authentication
export const phoneAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, phone } = req.body;

    if (!idToken || !phone) {
      res.status(400).json({ error: 'ID token and phone number are required' });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, phone_number } = decodedToken;

    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      user = await User.findOne({ phone: phone_number || phone });
      
      if (user) {
        // Link existing account
        user.firebaseUid = uid;
        user.authProvider = 'phone';
        user.isPhoneVerified = true;
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: `${phone}@phone.local`, // Temporary email
          name: `User ${phone}`,
          phone: phone_number || phone,
          firebaseUid: uid,
          authProvider: 'phone',
          isPhoneVerified: true
        });
        await user.save();
      }
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Phone authentication successful',
      token,
      user
    });
  } catch (error) {
    console.error('Phone auth error:', error);
    res.status(500).json({ error: 'Phone authentication failed' });
  }
};

// Get current user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({ user: req.user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};

// Logout (mainly for clearing any server-side sessions if needed)
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // In a stateless JWT setup, logout is mainly handled client-side
    // But you could implement token blacklisting here if needed
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};
