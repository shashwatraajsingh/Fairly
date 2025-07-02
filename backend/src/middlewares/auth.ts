import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    // Try JWT first (for email/password auth)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = user;
      req.userId = user._id;
      next();
      return;
    } catch (jwtError) {
      // If JWT fails, try Firebase token (for Google/Phone auth)
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (!user) {
          res.status(401).json({ error: 'User not found' });
          return;
        }

        req.user = user;
        req.userId = user._id;
        next();
        return;
      } catch (firebaseError) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    // Try to authenticate, but don't fail if it doesn't work
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    } catch (error) {
      // Ignore authentication errors for optional auth
    }

    next();
  } catch (error) {
    next();
  }
};
