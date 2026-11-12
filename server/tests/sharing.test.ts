import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { seed } from '../src/db/seed.js';

beforeAll(() => {
  seed();
});

describe('Document Sharing and Access Control API', () => {
  let docId: string;

  beforeAll(async () => {
    // Create fresh doc owned by Vaishnavi
    const res = await request(app)
      .post('/api/documents')
      .set('x-user-id', 'user-vaishnavi')
      .send({
        title: 'Team Roadmap 2026',
        content: '<p>Confidential roadmap document.</p>'
      });
    docId = res.body.document.id;
  });

  it('unauthorized user should receive 403 Forbidden', async () => {
    // Sam is not a collaborator yet
    const res = await request(app)
      .get(`/api/documents/${docId}`)
      .set('x-user-id', 'user-sam');

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  it('owner can share document with Alex as Editor', async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set('x-user-id', 'user-vaishnavi')
      .send({
        email: 'alex.rivera@ajaia.io',
        role: 'editor'
      });

    expect(res.status).toBe(200);
    expect(res.body.collaborators).toBeInstanceOf(Array);
    const alexCollab = res.body.collaborators.find((c: any) => c.user_id === 'user-alex');
    expect(alexCollab).toBeDefined();
    expect(alexCollab.role).toBe('editor');
  });

  it('Alex (Editor) can read and edit document content', async () => {
    // Alex reads
    const readRes = await request(app)
      .get(`/api/documents/${docId}`)
      .set('x-user-id', 'user-alex');

    expect(readRes.status).toBe(200);
    expect(readRes.body.document.userRole).toBe('editor');
    expect(readRes.body.document.canEdit).toBe(true);

    // Alex edits
    const editRes = await request(app)
      .put(`/api/documents/${docId}`)
      .set('x-user-id', 'user-alex')
      .send({
        title: 'Team Roadmap 2026 (Alex Comments)',
        content: '<p>Confidential roadmap document with Alex updates.</p>'
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.document.title).toBe('Team Roadmap 2026 (Alex Comments)');
  });

  it('Alex (Editor) cannot delete the document (Owner only)', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docId}`)
      .set('x-user-id', 'user-alex');

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Only the document owner can delete');
  });

  it('owner can share document with Priya as Viewer', async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set('x-user-id', 'user-vaishnavi')
      .send({
        userId: 'user-priya',
        role: 'viewer'
      });

    expect(res.status).toBe(200);
    const priyaCollab = res.body.collaborators.find((c: any) => c.user_id === 'user-priya');
    expect(priyaCollab).toBeDefined();
    expect(priyaCollab.role).toBe('viewer');
  });

  it('Priya (Viewer) cannot edit the document (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/documents/${docId}`)
      .set('x-user-id', 'user-priya')
      .send({
        title: 'Hacked Title',
        content: '<p>Illegal modification attempt.</p>'
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Viewer permissions');
  });

  it('owner can revoke collaborator access', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docId}/share/user-priya`)
      .set('x-user-id', 'user-vaishnavi');

    expect(res.status).toBe(200);
    const priyaCollab = res.body.collaborators.find((c: any) => c.user_id === 'user-priya');
    expect(priyaCollab).toBeUndefined();

    // Verify Priya now has 403 Forbidden access
    const checkRes = await request(app)
      .get(`/api/documents/${docId}`)
      .set('x-user-id', 'user-priya');

    expect(checkRes.status).toBe(403);
  });
});
