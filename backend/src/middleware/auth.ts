import { NextFunction, Request, Response } from 'express';

export function authenticateToken(_req: Request, _res: Response, next: NextFunction): void {
  next();
}
