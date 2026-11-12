import { db, initDb } from './index.js';
import { v4 as uuidv4 } from 'uuid';

export function seed() {
  console.log('🌱 Seeding database with 4 corporate team members and Google Docs templates...');

  // Drop tables to apply updated schema
  db.exec(`
    DROP TABLE IF EXISTS document_versions;
    DROP TABLE IF EXISTS document_attachments;
    DROP TABLE IF EXISTS document_collaborators;
    DROP TABLE IF EXISTS documents;
    DROP TABLE IF EXISTS users;
  `);

  initDb();

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, avatar_color, role_title, department, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    {
      id: 'user-vaishnavi',
      name: 'Vaishnavi A S',
      email: 'vaishnavi@ajaia.io',
      avatarColor: '#1a73e8', // Google Docs Blue
      roleTitle: 'Lead Product Engineer (Candidate)',
      department: 'Product Engineering',
      password: 'password123'
    },
    {
      id: 'user-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@ajaia.io',
      avatarColor: '#9333ea', // Purple
      roleTitle: 'Director of Product Management',
      department: 'Product Evaluation',
      password: 'password123'
    },
    {
      id: 'user-priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@ajaia.io',
      avatarColor: '#0d9488', // Teal
      roleTitle: 'Staff Systems Architect',
      department: 'Platform Engineering',
      password: 'password123'
    },
    {
      id: 'user-marcus',
      name: 'Marcus Chen',
      email: 'marcus.chen@ajaia.io',
      avatarColor: '#ea580c', // Orange/Amber
      roleTitle: 'Security & Compliance Lead',
      department: 'Information Security',
      password: 'password123'
    }
  ];

  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, u.avatarColor, u.roleTitle, u.department, u.password);
  }

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);

  const insertCollab = db.prepare(`
    INSERT INTO document_collaborators (id, document_id, user_id, role)
    VALUES (?, ?, ?, ?)
  `);

  const insertVersion = db.prepare(`
    INSERT INTO document_versions (id, document_id, title, content, saved_by, version_label, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  // Document 1: Product Strategy (Owned by Vaishnavi)
  const doc1Id = 'doc-prod-strategy';
  const doc1Content = `
    <h1>Product Vision: Ajaia Collaborative Workspace</h1>
    <p>Welcome to <strong>Ajaia Docs</strong>, a lightweight collaborative document editor engineered for velocity, clarity, and team cohesion.</p>
    
    <h2>Core Value Propositions</h2>
    <p>Our research revealed that modern cross-functional teams lose up to <em>28% of their creative momentum</em> switching between fragmented writing and task surfaces.</p>
    <ul>
      <li><strong>Immediate Frictionless Authoring:</strong> Instant loading without heavy telemetry bloat.</li>
      <li><strong>Permission-Aware Collaboration:</strong> Explicit owner, editor, and viewer boundaries.</li>
      <li><strong>Native File Imports:</strong> Direct ingestion of Markdown and plaintext knowledge.</li>
    </ul>

    <h2>Q4 Strategic Milestones</h2>
    <ol>
      <li>Deploy persistent workspace with instant autosave.</li>
      <li>Ship granular access control with role differentiation.</li>
      <li>Support drag-and-drop file imports and multi-format document attachments.</li>
    </ol>

    <blockquote>"Simplicity in architecture yields velocity in execution." — Product Engineering Tenet</blockquote>

    <pre><code>// Example access verification logic
const canEdit = userRole === 'owner' || userRole === 'editor';
if (!canEdit) throw new ForbiddenError('Viewing mode only');</code></pre>
  `;

  insertDoc.run(
    doc1Id,
    'Product Vision: Ajaia Collaborative Workspace',
    doc1Content.trim(),
    'user-vaishnavi',
    '-2 days',
    '-10 minutes'
  );

  // Collaborators for Doc 1
  insertCollab.run(uuidv4(), doc1Id, 'user-alex', 'editor');
  insertCollab.run(uuidv4(), doc1Id, 'user-priya', 'viewer');

  // Seed versions for Doc 1
  insertVersion.run(
    uuidv4(),
    doc1Id,
    'Product Vision (Initial Draft)',
    '<h1>Product Vision Draft</h1><p>Initial draft by Vaishnavi outlining core product milestones.</p>',
    'user-vaishnavi',
    'v1.0 - Initial Draft',
    '-2 days'
  );

  insertVersion.run(
    uuidv4(),
    doc1Id,
    'Product Vision: Ajaia Collaborative Workspace',
    doc1Content.trim(),
    'user-vaishnavi',
    'v1.1 - Added Technical Tenets',
    '-10 minutes'
  );

  // Document 2: Sprint Notes (Owned by Alex)
  const doc2Id = 'doc-sprint-notes';
  const doc2Content = `
    <h1>Sprint 42: Execution Notes & Review Goals</h1>
    <p>Led by <strong>Alex Rivera</strong>. Focus this sprint is evaluating candidate full-stack submissions and validating production architecture.</p>
    
    <h2>Evaluation Checklist</h2>
    <ul>
      <li><strong>Document Creation & Editing:</strong> Does the editing flow feel coherent, robust, and responsive?</li>
      <li><strong>File Upload & Attachment:</strong> Can files be imported cleanly or attached to documents?</li>
      <li><strong>Sharing Model:</strong> Is there a visible distinction between owned and shared documents? Can access be switched?</li>
      <li><strong>Code & AI-Workflow Quality:</strong> Are the design notes and AI-usage reflections grounded in genuine engineering judgment?</li>
    </ul>

    <p><em>Status:</em> Currently reviewing the live deployment and verifying Vitest coverage.</p>
  `;

  insertDoc.run(
    doc2Id,
    'Sprint 42: Execution Notes & Review Goals',
    doc2Content.trim(),
    'user-alex',
    '-1 day',
    '-1 hour'
  );

  // Vaishnavi is an Editor on Doc 2!
  insertCollab.run(uuidv4(), doc2Id, 'user-vaishnavi', 'editor');

  // Document 3: Architecture Guidelines (Owned by Priya)
  const doc3Id = 'doc-arch-guidelines';
  const doc3Content = `
    <h1>Design Guidelines & System Architecture</h1>
    <p>Authored by <strong>Priya Sharma</strong>. This document outlines our engineering standards for full-stack applications.</p>
    
    <h2>Persistence & Data Flow</h2>
    <p>We mandate relational integrity with foreign key cascading and atomic transactions. SQLite WAL mode provides reliable multi-connection read performance with minimal memory overhead.</p>

    <h2>Security & Role Boundaries</h2>
    <p>Every mutation endpoint must verify:</p>
    <ol>
      <li>Identity of the requesting principal.</li>
      <li>Direct ownership or active collaboration membership.</li>
      <li>Explicit role capability (e.g. <code>editor</code> can mutate content, but only <code>owner</code> can alter permissions or delete).</li>
    </ol>
  `;

  insertDoc.run(
    doc3Id,
    'Design Guidelines & System Architecture',
    doc3Content.trim(),
    'user-priya',
    '-3 days',
    '-5 hours'
  );

  // Vaishnavi is a Viewer on Doc 3!
  insertCollab.run(uuidv4(), doc3Id, 'user-vaishnavi', 'viewer');

  // Document 4: Getting Started Guide (Owned by Vaishnavi)
  const doc4Id = 'doc-getting-started';
  const doc4Content = `
    <h1>Welcome to Ajaia Docs 🚀</h1>
    <p>This application was crafted by <strong>Vaishnavi A S</strong> for the Ajaia LLC AI-Native Full Stack Developer assignment.</p>
    
    <h2>What You Can Test in This Prototype:</h2>
    <ul>
      <li><strong>Rich Text Formatting:</strong> Select text to apply bold, italics, underlines, bulleted/numbered lists, or headings.</li>
      <li><strong>Dynamic Renaming:</strong> Click on the title in the top toolbar to rename the document with instant auto-save.</li>
      <li><strong>Simulated User Switching & Sign In:</strong> Sign in as <em>Vaishnavi</em> (Owner), <em>Alex</em> (Editor), <em>Priya</em> (Viewer), or <em>Marcus</em> to see permissions adapt live!</li>
      <li><strong>File Upload & Ingestion:</strong> Click "Import File" to upload any Markdown or TXT file into a brand new document!</li>
      <li><strong>File Attachments:</strong> Attach files directly to this document using the paperclip attachment panel.</li>
      <li><strong>Document Sharing:</strong> Open the "Share" modal to grant viewer or editor rights to another team member or revoke them.</li>
      <li><strong>Export Options:</strong> Export your document to Markdown, HTML, or formatted PDF printout.</li>
    </ul>
    
    <p>Enjoy testing the experience!</p>
  `;

  insertDoc.run(
    doc4Id,
    'Welcome to Ajaia Docs 🚀',
    doc4Content.trim(),
    'user-vaishnavi',
    '-3 hours',
    '-2 minutes'
  );

  console.log('✅ Database seeded successfully with 4 corporate team users and 4 rich documents!');
}

// Allow direct CLI execution
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed();
}
