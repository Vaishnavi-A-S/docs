import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/users - List all seeded users
router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, name, email, avatar_color, role_title, created_at FROM users ORDER BY name ASC').all();
  res.json({ users });
});

// GET /api/users/me - Get current active user
router.get('/me', (req, res) => {
  res.json({ user: req.user });
});

export default router;
