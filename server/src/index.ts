import dotenv from 'dotenv';
import { app } from './app.js';
import { db, initDb } from './db/index.js';
import { seed } from './db/seed.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize Database & check if seed is needed
initDb();
const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
if (userCount === 0) {
  console.log('Database empty. Running initial seed...');
  seed();
}

app.listen(PORT, () => {
  console.log(`🚀 Ajaia Docs Server listening on http://localhost:${PORT}`);
  console.log(`📁 API endpoints active at http://localhost:${PORT}/api`);
});
