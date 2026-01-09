import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = await authService.verifyToken(token);

    if (!decoded) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware that accepts token from either header or query parameter
export const authenticateTokenFromHeaderOrQuery = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    // If not in header, try query parameter
    if (!token && req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = await authService.verifyToken(token);

    if (!decoded) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
