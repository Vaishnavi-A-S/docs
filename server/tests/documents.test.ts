import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { seed } from '../src/db/seed.js';

beforeAll(() => {
  seed();
});

describe('Document Creation and Editing API', () => {
  let createdDocId: string;

  it('should list seeded documents for Vaishnavi', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('x-user-id', 'user-vaishnavi');

    expect(res.status).toBe(200);
    expect(res.body.documents).toBeInstanceOf(Array);
    expect(res.body.documents.length).toBeGreaterThanOrEqual(1);

    const doc = res.body.documents.find((d: any) => d.id === 'doc-prod-strategy');
    expect(doc).toBeDefined();
    expect(doc.isOwner).toBe(true);
    expect(doc.userRole).toBe('owner');
  });

  it('should create a new document with valid title', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('x-user-id', 'user-vaishnavi')
      .send({
        title: 'Quarterly Planning Document',
        content: '<h1>Q3 Strategy</h1><p>Key priorities for the team.</p>'
      });

    expect(res.status).toBe(201);
    expect(res.body.document).toBeDefined();
    expect(res.body.document.title).toBe('Quarterly Planning Document');
    expect(res.body.document.userRole).toBe('owner');
    expect(res.body.document.isOwner).toBe(true);

    createdDocId = res.body.document.id;
  });

  it('should reject document creation with an empty title', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('x-user-id', 'user-vaishnavi')
      .send({
        title: '   '
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should fetch the created document by id', async () => {
    const res = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('x-user-id', 'user-vaishnavi');

    expect(res.status).toBe(200);
    expect(res.body.document.id).toBe(createdDocId);
    expect(res.body.document.title).toBe('Quarterly Planning Document');
    expect(res.body.document.canEdit).toBe(true);
  });

  it('should rename and update document content', async () => {
    const res = await request(app)
      .put(`/api/documents/${createdDocId}`)
      .set('x-user-id', 'user-vaishnavi')
      .send({
        title: 'Updated Planning Document - 2026',
        content: '<h1>Updated Priorities</h1><p>Revised delivery milestones.</p>'
      });

    expect(res.status).toBe(200);
    expect(res.body.document.title).toBe('Updated Planning Document - 2026');
    expect(res.body.document.content).toContain('Updated Priorities');
  });

  it('should delete the document by owner', async () => {
    const res = await request(app)
      .delete(`/api/documents/${createdDocId}`)
      .set('x-user-id', 'user-vaishnavi');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify document is now 404
    const checkRes = await request(app)
      .get(`/api/documents/${createdDocId}`)
      .set('x-user-id', 'user-vaishnavi');

    expect(checkRes.status).toBe(404);
  });
});
