import { NextFunction, Request, Response } from 'express';

/**
 * GraphQL/API Error Handler
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', 400, message, context);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Not authenticated') {
    super('AUTHENTICATION_ERROR', 401, message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super('AUTHORIZATION_ERROR', 403, message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super('NOT_FOUND', 404, message);
  }
}

export class RateLimitError extends ApiError {
  constructor(
    public retryAfter: number,
    public limit: number,
    public remaining: number
  ) {
    super(
      'RATE_LIMIT_EXCEEDED',
      429,
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      { retryAfter, limit, remaining }
    );
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super('INTERNAL_SERVER_ERROR', 500, message, context);
  }
}

/**
 * Error handler middleware
 */
export function errorHandler(
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // eslint-disable-next-line no-console
  console.error('Error:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        ...(err.context && { extensions: err.context })
      }
    });
  } else {
    res.status(500).json({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

/**
 * Async route wrapper to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
