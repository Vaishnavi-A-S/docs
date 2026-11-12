import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve current directory for both ES modules and Node
const dbDirectory = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDirectory, 'ajaia_docs.db');

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency & enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }
}

export default db;
