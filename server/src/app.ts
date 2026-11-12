import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import usersRouter from './routes/users.js';
import documentsRouter from './routes/documents.js';
import filesRouter from './routes/files.js';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Ajaia Docs API', timestamp: new Date().toISOString() });
});

// Authenticated API routes
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/documents', authMiddleware, documentsRouter);
app.use('/api/files', authMiddleware, filesRouter);

// Serve Client static build in production
const candidatePaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist')
];
const clientDistPath = candidatePaths.find(p => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  // Catch-all SPA handler
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

export default app;
