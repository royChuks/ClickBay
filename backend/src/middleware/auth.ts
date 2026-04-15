import { NextFunction, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RequestContext } from '../types';

export interface AuthRequest extends Request {
  context?: RequestContext;
}

/**
 * GraphQL Context Builder with Authentication
 */
export function buildAuthContext(req: AuthRequest): RequestContext {
  const token = extractToken(req);
  
  if (!token) {
    return {
      isAuthenticated: false
    };
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    
    return {
      userId: decoded.userId,
      token,
      isAuthenticated: true
    };
  } catch (error) {
    return {
      isAuthenticated: false
    };
  }
}

/**
 * Extract JWT token from Authorization header or cookies
 */
export function extractToken(req: AuthRequest): string | null {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }

  return null;
}

/**
 * Generate JWT Token
 */
export function generateToken(userId: string, expiresIn: string = '1h'): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const options: SignOptions = { expiresIn };
  return jwt.sign({ userId }, secret, options);
}

/**
 * Generate Refresh Token
 */
export function generateRefreshToken(userId: string, expiresIn: string = '7d'): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  const options: SignOptions = { expiresIn };
  return jwt.sign({ userId }, secret, options);
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): any {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Express middleware to authenticate requests
 */
export function authenticateToken(req: AuthRequest, _res: Response, next: NextFunction): void {
  const context = buildAuthContext(req);
  req.context = context;
  next();
}

/**
 * GraphQL auth guard - ensures user is authenticated
 */
export function requireAuth(context: RequestContext): void {
  if (!context.isAuthenticated || !context.userId) {
    throw new Error('Authentication required. Please log in.');
  }
}
