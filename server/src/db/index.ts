import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Resolve directory for SQLite database storage
const dbDirectory = process.env.DATA_DIR 
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDirectory, 'ajaia_docs.db');

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency & enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Fallback schema definition ensures zero file-lookup failure across bundled distributions
const FALLBACK_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_color TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Core Team',
  password TEXT NOT NULL DEFAULT 'ajaia2026',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_collaborators (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('viewer', 'editor')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_attachments (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  saved_by TEXT NOT NULL REFERENCES users(id),
  version_label TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_collab_doc ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS idx_collab_user ON document_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_attachments_doc ON document_attachments(document_id);
CREATE INDEX IF NOT EXISTS idx_versions_doc ON document_versions(document_id);
`;

export function initDb() {
  const candidatePaths = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../../src/db/schema.sql'),
    path.resolve(process.cwd(), 'server/src/db/schema.sql'),
    path.resolve(process.cwd(), 'src/db/schema.sql')
  ];

  const foundPath = candidatePaths.find(p => fs.existsSync(p));
  if (foundPath) {
    const schema = fs.readFileSync(foundPath, 'utf-8');
    db.exec(schema);
  } else {
    db.exec(FALLBACK_SCHEMA_SQL);
  }
}

export default db;
