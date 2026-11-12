import { db, initDb } from './index.js';
import { v4 as uuidv4 } from 'uuid';

export function seed() {
  console.log('🌱 Seeding database with Ajaia AI Strategy & Engineering documents...');

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
      avatarColor: '#1a73e8', // Ajaia Core Blue
      roleTitle: 'Lead AI Engineer (Candidate)',
      department: 'AI Strategy & Custom Dev',
      password: 'password123'
    },
    {
      id: 'user-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@ajaia.io',
      avatarColor: '#9333ea', // Purple
      roleTitle: 'Engagement Partner & Product Lead',
      department: 'Client Advisory',
      password: 'password123'
    },
    {
      id: 'user-priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@ajaia.io',
      avatarColor: '#0d9488', // Teal
      roleTitle: 'Staff Systems Architect (Client Lead)',
      department: 'Enterprise Platform',
      password: 'password123'
    },
    {
      id: 'user-marcus',
      name: 'Marcus Chen',
      email: 'marcus.chen@ajaia.io',
      avatarColor: '#ea580c', // Coral/Amber
      roleTitle: 'Security & Governance Officer',
      department: 'Information Security & HIPAA',
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

  // Document 1: Ajaia AI Strategy & Advisory Roadmap
  const doc1Id = 'doc-prod-strategy';
  const doc1Content = `
    <h1>Enterprise AI Strategy & Roadmap: HealthTech Modernization</h1>
    <p>Client Deliverable prepared by <strong>Ajaia LLC</strong> (AI Strategy & Engineering Practice).</p>
    <p>Lead AI Consultant: <strong>Vaishnavi A S</strong> • Engagement Lead: <strong>Alex Rivera</strong></p>

    <h2>1. Executive Summary</h2>
    <p>This engagement transitions our healthcare client from exploratory generative AI pilots into a <strong>governed, production-ready AI ecosystem</strong>. By establishing private model infrastructure and workflow automation, the client will realize a projected <em>42% reduction in administrative overhead</em> while maintaining strict HIPAA compliance.</p>

    <h2>2. Strategic Pillars & Workstreams</h2>
    <ul>
      <li><strong>Pillar 1 — AI Strategy & Governance:</strong> Establish multi-stakeholder AI governance committee and model evaluation framework.</li>
      <li><strong>Pillar 2 — Custom Multi-Model Gateway:</strong> Deploy intelligent model routing across Anthropic Claude (clinical reasoning) and OpenAI (summarization).</li>
      <li><strong>Pillar 3 — Autonomous Clinical Workflow Agents:</strong> Automate prior-authorization packet synthesis and medical records indexing.</li>
      <li><strong>Pillar 4 — Workforce Enablement:</strong> Roll out specialized prompt engineering SOPs for 400+ clinical and administrative personnel.</li>
    </ul>

    <h2>3. Architecture & Security Tenets</h2>
    <blockquote>"Enterprise AI adoption fails at the boundary of data privacy and unverified accuracy. Deterministic guardrails are mandatory." — Ajaia Engineering Tenet</blockquote>

    <pre><code>// Ajaia Governance Gateway routing check
export async function routeClinicalPrompt(prompt: string): Promise<ModelTarget> {
  const containsPHI = await scanForProtectedHealthInfo(prompt);
  if (containsPHI) {
    return { model: 'private-vpc-claude-3-5', encryption: 'AES-256' };
  }
  return { model: 'standard-gateway', costTier: 'optimized' };
}</code></pre>
  `;

  insertDoc.run(
    doc1Id,
    'Enterprise AI Strategy & Roadmap: HealthTech Modernization',
    doc1Content.trim(),
    'user-vaishnavi',
    '-2 days',
    '-10 minutes'
  );

  insertCollab.run(uuidv4(), doc1Id, 'user-alex', 'editor');
  insertCollab.run(uuidv4(), doc1Id, 'user-priya', 'viewer');

  insertVersion.run(
    uuidv4(),
    doc1Id,
    'Enterprise AI Strategy Draft v1.0',
    '<h1>Enterprise AI Strategy Initial Draft</h1><p>Initial assessment and stakeholder interviews by Vaishnavi A S.</p>',
    'user-vaishnavi',
    'v1.0 - Discovery Phase',
    '-2 days'
  );

  insertVersion.run(
    uuidv4(),
    doc1Id,
    'Enterprise AI Strategy & Roadmap: HealthTech Modernization',
    doc1Content.trim(),
    'user-vaishnavi',
    'v1.1 - Added Security & Routing Spec',
    '-10 minutes'
  );

  // Document 2: Agent Workflow Spec (Owned by Alex)
  const doc2Id = 'doc-sprint-notes';
  const doc2Content = `
    <h1>Agentic Workflow Specification: Automated Financial Due Diligence Bot</h1>
    <p>Author: <strong>Alex Rivera</strong> (Ajaia Advisory Practice) • Reviewer: <strong>Vaishnavi A S</strong></p>

    <h2>1. System Objective</h2>
    <p>Design an autonomous multi-agent pipeline (Ajaia Scout Engine) that ingests 10-K filings, earnings transcripts, and private equity deal rooms to output synthesized investment memos.</p>

    <h2>2. Multi-Agent Pipeline Stages</h2>
    <ol>
      <li><strong>Ingestion Agent:</strong> Extracts tables, footnotes, and regulatory warnings from raw PDF disclosures.</li>
      <li><strong>Reconciliation Agent:</strong> Cross-checks reported GAAP metrics against non-GAAP definitions.</li>
      <li><strong>Risk Synthesis Agent:</strong> Generates executive red-flag summaries and ESG risk ratings.</li>
      <li><strong>Human-in-the-Loop Checkpoint:</strong> Requires managing director sign-off before publishing deal briefing.</li>
    </ol>

    <h2>3. Acceptance Criteria</h2>
    <ul>
      <li>Sub-4-minute processing time for 200-page prospectus documents.</li>
      <li>Zero hallucinated numerical figures (100% citation verification against source PDF offsets).</li>
    </ul>
  `;

  insertDoc.run(
    doc2Id,
    'Agentic Workflow Specification: Automated Financial Due Diligence Bot',
    doc2Content.trim(),
    'user-alex',
    '-1 day',
    '-1 hour'
  );

  insertCollab.run(uuidv4(), doc2Id, 'user-vaishnavi', 'editor');

  // Document 3: Architecture Guidelines (Owned by Priya)
  const doc3Id = 'doc-arch-guidelines';
  const doc3Content = `
    <h1>Technical Architecture: Enterprise Multi-Model LLM Gateway</h1>
    <p>Author: <strong>Priya Sharma</strong> (Staff Systems Architect) • Audience: <strong>Engineering & Governance</strong></p>

    <h2>1. Purpose & Motivation</h2>
    <p>Enterprise clients must avoid vendor lock-in. Ajaia's Multi-Model Gateway provides a unified API abstraction layer with automatic failover, latency caching, and token cost attribution.</p>

    <h2>2. Core Gateway Capabilities</h2>
    <ul>
      <li><strong>Dynamic Provider Fallback:</strong> Seamless failover between Anthropic, OpenAI, and self-hosted open weights.</li>
      <li><strong>Semantic Semantic Caching:</strong> 35% reduction in token burn rate for repetitive enterprise queries.</li>
      <li><strong>Strict Data Perimeter:</strong> Zero retention agreements enforced across all downstream LLM endpoints.</li>
    </ul>
  `;

  insertDoc.run(
    doc3Id,
    'Technical Architecture: Enterprise Multi-Model LLM Gateway',
    doc3Content.trim(),
    'user-priya',
    '-3 days',
    '-5 hours'
  );

  insertCollab.run(uuidv4(), doc3Id, 'user-vaishnavi', 'viewer');

  // Document 4: Welcome & AI-Native Operational Guide
  const doc4Id = 'doc-getting-started';
  const doc4Content = `
    <h1>Welcome to Ajaia Docs — AI-Native Collaborative Workspace</h1>
    <p>Engineered by <strong>Vaishnavi A S</strong> for the <strong>Ajaia LLC</strong> Full-Stack Developer Assessment.</p>

    <h2>Customized for Ajaia's Consulting & Engineering Workflows:</h2>
    <ul>
      <li><strong>Specialized Consulting Templates:</strong> One-click creation of AI Strategy Roadmaps, Agentic SOPs, Technical RFCs, and Diligence Reports.</li>
      <li><strong>✨ Built-in Ajaia AI Assistant:</strong> Click the "Ajaia AI" button on the toolbar to draft executive summaries, audit compliance (HIPAA / SOC 2), or generate action items directly into the document.</li>
      <li><strong>Enterprise Role Enforcement:</strong> Switch between Vaishnavi (Owner), Alex (Partner/Editor), Priya (Client Lead/Viewer), and Marcus (Compliance Officer) to test strict permission boundaries.</li>
      <li><strong>File Ingestion Engine:</strong> Ingest Markdown (.md) specs or attach client spreadsheets and PDFs to any document.</li>
    </ul>

    <p><em>"Turning AI into Measurable Business Impact."</em> — Ajaia LLC</p>
  `;

  insertDoc.run(
    doc4Id,
    'Welcome to Ajaia Docs — AI-Native Collaborative Workspace',
    doc4Content.trim(),
    'user-vaishnavi',
    '-3 hours',
    '-2 minutes'
  );

  console.log('✅ Database seeded successfully with Ajaia AI workflows and documents!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed();
}
