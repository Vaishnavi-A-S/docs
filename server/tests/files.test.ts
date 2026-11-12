import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { app } from '../src/app.js';
import { seed } from '../src/db/seed.js';

beforeAll(() => {
  seed();
});

describe('File Import and Attachment API', () => {
  const tmpTestFile = path.resolve(process.cwd(), 'tests', 'sample-doc.md');

  beforeAll(() => {
    fs.writeFileSync(
      tmpTestFile,
      `# Architecture RFC

This is an **imported proposal** for Ajaia.

## Key Features
- High performance
- Robust access control
- Zero latency
`
    );
  });

  it('should import markdown file and create a new editable document', async () => {
    const res = await request(app)
      .post('/api/files/import')
      .set('x-user-id', 'user-vaishnavi')
      .attach('file', tmpTestFile);

    expect(res.status).toBe(201);
    expect(res.body.document).toBeDefined();
    expect(res.body.document.title).toBe('Sample Doc');
    expect(res.body.document.content).toContain('<h1>Architecture RFC</h1>');
    expect(res.body.document.content).toContain('<strong>imported proposal</strong>');
    expect(res.body.document.content).toContain('<li>High performance</li>');
    expect(res.body.document.isOwner).toBe(true);
  });

  it('should reject unsupported file extensions for document creation', async () => {
    const invalidFile = path.resolve(process.cwd(), 'tests', 'test.exe');
    fs.writeFileSync(invalidFile, 'fake binary');

    const res = await request(app)
      .post('/api/files/import')
      .set('x-user-id', 'user-vaishnavi')
      .attach('file', invalidFile);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Unsupported file format');

    if (fs.existsSync(invalidFile)) fs.unlinkSync(invalidFile);
  });

  it('should attach a file to an existing document', async () => {
    const res = await request(app)
      .post('/api/files/documents/doc-prod-strategy/attachments')
      .set('x-user-id', 'user-vaishnavi')
      .attach('attachment', tmpTestFile);

    expect(res.status).toBe(201);
    expect(res.body.attachments).toBeInstanceOf(Array);
    expect(res.body.attachments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.attachments[0].original_name).toBe('sample-doc.md');
  });

  afterAll(() => {
    if (fs.existsSync(tmpTestFile)) {
      fs.unlinkSync(tmpTestFile);
    }
  });
});
