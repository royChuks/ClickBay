import { NextFunction, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RequestContext } from '../types';
import { AuthenticationError } from './errors';
import { memoryStore } from '../database/memory-store';

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
    if (memoryStore.revokedAccessTokens.has(token)) {
      return {
        isAuthenticated: false
      };
    }

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
export function generateToken(userId: string, expiresIn: SignOptions['expiresIn'] = '1h'): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const options: SignOptions = { expiresIn: resolveExpiresIn(process.env.JWT_EXPIRY, expiresIn) };
  return jwt.sign({ userId }, secret, options);
}

/**
 * Generate Refresh Token
 */
export function generateRefreshToken(userId: string, expiresIn: SignOptions['expiresIn']= '7d'): string {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  const resolvedExpiresIn = resolveExpiresIn(process.env.REFRESH_TOKEN_EXPIRY, expiresIn);
  const options: SignOptions = { expiresIn: resolvedExpiresIn };
  const token = jwt.sign({ userId }, secret, options);
  const expiresAt = Date.now() + parseExpiryToMs(resolvedExpiresIn);

  memoryStore.activeRefreshTokens.set(token, {
    token,
    userId,
    expiresAt
  });

  return token;
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): any {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    const decoded = jwt.verify(token, secret);
    const storedToken = memoryStore.activeRefreshTokens.get(token);

    if (!storedToken || storedToken.expiresAt <= Date.now()) {
      memoryStore.activeRefreshTokens.delete(token);
      throw new AuthenticationError('Refresh token is invalid or expired');
    }

    return decoded;
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
}

export function revokeRefreshToken(token: string): void {
  memoryStore.activeRefreshTokens.delete(token);
}

export function revokeAllRefreshTokensForUser(userId: string): void {
  for (const [token, storedToken] of memoryStore.activeRefreshTokens.entries()) {
    if (storedToken.userId === userId) {
      memoryStore.activeRefreshTokens.delete(token);
    }
  }
}

export function revokeAccessToken(token: string): void {
  memoryStore.revokedAccessTokens.add(token);
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
    throw new AuthenticationError('Authentication required. Please log in.');
  }
}

function parseExpiryToMs(expiresIn: SignOptions['expiresIn']): number {
  if (typeof expiresIn === 'number') {
    return expiresIn * 1000;
  }

  const raw = String(expiresIn).trim();
  const match = raw.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
}

function resolveExpiresIn(
  preferredValue: string | undefined,
  fallbackValue: SignOptions['expiresIn']
): SignOptions['expiresIn'] {
  if (preferredValue) {
    return preferredValue as SignOptions['expiresIn'];
  }

  return fallbackValue;
}
