import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/index.js';
import { authMiddleware, User } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login - Login via email/password or 1-click persona ID
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, userId } = req.body;

    let user: User | undefined;

    if (userId) {
      user = db.prepare('SELECT id, name, email, avatar_color, role_title, department FROM users WHERE id = ?').get(userId) as User | undefined;
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      // Handle both official and candidate email alias
      if (cleanEmail === '2023vaishnavi.as@vidyashilp.edu.in' || cleanEmail === 'vaishnavi@ajaia.io') {
        user = db.prepare('SELECT id, name, email, avatar_color, role_title, department FROM users WHERE id = ?').get('user-vaishnavi') as User | undefined;
      } else {
        user = db.prepare('SELECT id, name, email, avatar_color, role_title, department FROM users WHERE LOWER(email) = ?').get(cleanEmail) as User | undefined;
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials. Please select one of the seeded team accounts or enter a valid corporate email.'
      });
    }

    // Return token and user
    res.json({
      success: true,
      user,
      token: `token-${user.id}-${Date.now()}`
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me - Get current active user
router.get('/me', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// POST /api/auth/logout - Logout
router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
