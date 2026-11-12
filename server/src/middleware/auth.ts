import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role_title: string;
  department?: string;
  created_at: string;
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Support both custom header x-user-id and query parameter ?userId=
  const headerUserId = req.headers['x-user-id'] as string;
  const queryUserId = req.query.userId as string;
  const requestedUserId = headerUserId || queryUserId || 'user-vaishnavi';

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(requestedUserId) as User | undefined;

  if (user) {
    req.user = user;
    return next();
  }

  // Fallback to default user if user ID is unknown
  const defaultUser = db.prepare('SELECT * FROM users WHERE id = ?').get('user-vaishnavi') as User | undefined;
  if (defaultUser) {
    req.user = defaultUser;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid user identity' });
}
