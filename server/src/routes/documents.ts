import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';

const router = Router();

// Permission Helper
export type DocRole = 'owner' | 'editor' | 'viewer';

export function getDocAccess(docId: string, userId: string): { role: DocRole | null; document: any | null } {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as any;
  if (!doc) return { role: null, document: null };

  if (doc.owner_id === userId) {
    return { role: 'owner', document: doc };
  }

  const collab = db.prepare(`
    SELECT role FROM document_collaborators 
    WHERE document_id = ? AND user_id = ?
  `).get(docId, userId) as { role: 'viewer' | 'editor' } | undefined;

  if (collab) {
    return { role: collab.role, document: doc };
  }

  return { role: null, document: doc };
}

// GET /api/documents - List documents for current user
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const tab = (req.query.tab as string) || 'all'; // 'all', 'owned', 'shared'
    const search = ((req.query.search as string) || '').trim().toLowerCase();

    // Fetch documents owned by user or shared with user
    const query = `
      SELECT 
        d.id,
        d.title,
        d.content,
        d.owner_id,
        d.created_at,
        d.updated_at,
        u.name AS owner_name,
        u.email AS owner_email,
        u.avatar_color AS owner_avatar_color,
        CASE 
          WHEN d.owner_id = ? THEN 'owner'
          ELSE c.role
        END AS user_role,
        (SELECT COUNT(*) FROM document_collaborators WHERE document_id = d.id) AS collaborators_count,
        (SELECT COUNT(*) FROM document_attachments WHERE document_id = d.id) AS attachments_count
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      LEFT JOIN document_collaborators c ON d.id = c.document_id AND c.user_id = ?
      WHERE (d.owner_id = ? OR c.user_id = ?)
      ORDER BY datetime(d.updated_at) DESC
    `;

    const allDocs = db.prepare(query).all(userId, userId, userId, userId) as any[];

    let filtered = allDocs;

    if (tab === 'owned') {
      filtered = filtered.filter(doc => doc.user_role === 'owner');
    } else if (tab === 'shared') {
      filtered = filtered.filter(doc => doc.user_role === 'editor' || doc.user_role === 'viewer');
    }

    if (search) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(search) ||
        (doc.content && doc.content.toLowerCase().includes(search))
      );
    }

    // Format snippet preview
    const result = filtered.map(d => ({
      id: d.id,
      title: d.title,
      ownerId: d.owner_id,
      ownerName: d.owner_name,
      ownerEmail: d.owner_email,
      ownerAvatarColor: d.owner_avatar_color,
      userRole: d.user_role,
      isOwner: d.user_role === 'owner',
      collaboratorsCount: d.collaborators_count,
      attachmentsCount: d.attachments_count,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      snippet: d.content ? d.content.replace(/<[^>]+>/g, ' ').slice(0, 150).trim() : ''
    }));

    res.json({ documents: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents - Create new document
const createDocSchema = z.object({
  title: z.string().trim().min(1, 'Document title cannot be empty').default('Untitled Document'),
  content: z.string().optional().default('')
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createDocSchema.parse(req.body);
    const newDocId = `doc-${uuidv4()}`;

    const insert = db.prepare(`
      INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    insert.run(newDocId, parsed.title, parsed.content, req.user.id);

    // Save initial version
    const insertVersion = db.prepare(`
      INSERT INTO document_versions (id, document_id, title, content, saved_by, version_label, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    insertVersion.run(uuidv4(), newDocId, parsed.title, parsed.content, req.user.id, 'Initial Creation');

    const createdDoc = db.prepare(`
      SELECT d.*, u.name as owner_name, u.email as owner_email, u.avatar_color as owner_avatar_color
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      WHERE d.id = ?
    `).get(newDocId) as any;

    res.status(201).json({
      document: {
        id: createdDoc.id,
        title: createdDoc.title,
        content: createdDoc.content,
        ownerId: createdDoc.owner_id,
        ownerName: createdDoc.owner_name,
        ownerEmail: createdDoc.owner_email,
        ownerAvatarColor: createdDoc.owner_avatar_color,
        userRole: 'owner',
        isOwner: true,
        collaborators: [],
        attachments: [],
        createdAt: createdDoc.created_at,
        updatedAt: createdDoc.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id - Get document details
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!role) {
      return res.status(403).json({
        error: 'Forbidden: You do not have access to this document. Contact the document owner to request access.'
      });
    }

    const owner = db.prepare('SELECT id, name, email, avatar_color, role_title FROM users WHERE id = ?').get(document.owner_id) as any;

    const collaborators = db.prepare(`
      SELECT c.id, c.role, c.created_at, u.id as user_id, u.name, u.email, u.avatar_color, u.role_title
      FROM document_collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.document_id = ?
      ORDER BY c.created_at ASC
    `).all(docId);

    const attachments = db.prepare(`
      SELECT a.*, u.name as uploader_name
      FROM document_attachments a
      JOIN users u ON a.uploaded_by = u.id
      WHERE a.document_id = ?
      ORDER BY a.created_at DESC
    `).all(docId);

    res.json({
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        ownerId: document.owner_id,
        owner,
        userRole: role,
        isOwner: role === 'owner',
        canEdit: role === 'owner' || role === 'editor',
        collaborators,
        attachments,
        createdAt: document.created_at,
        updatedAt: document.updated_at
      }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/documents/:id - Update document (title and/or content)
const updateDocSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').optional(),
  content: z.string().optional(),
  createSnapshot: z.boolean().optional(),
  snapshotLabel: z.string().optional()
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!role || (role !== 'owner' && role !== 'editor')) {
      return res.status(403).json({
        error: 'Permission Denied: You have Viewer permissions and cannot edit this document.'
      });
    }

    const parsed = updateDocSchema.parse(req.body);

    const newTitle = parsed.title !== undefined ? parsed.title : document.title;
    const newContent = parsed.content !== undefined ? parsed.content : document.content;

    db.prepare(`
      UPDATE documents
      SET title = ?, content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(newTitle, newContent, docId);

    // Save version snapshot if explicitly asked
    if (parsed.createSnapshot) {
      const label = parsed.snapshotLabel || `Revision by ${req.user.name}`;
      db.prepare(`
        INSERT INTO document_versions (id, document_id, title, content, saved_by, version_label, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(uuidv4(), docId, newTitle, newContent, req.user.id, label);
    }

    const updated = db.prepare('SELECT * FROM documents WHERE id = ?').get(docId) as any;

    res.json({
      document: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updated_at,
        userRole: role
      }
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id - Delete document (Owner only)
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner') {
      return res.status(403).json({
        error: 'Permission Denied: Only the document owner can delete this document.'
      });
    }

    db.prepare('DELETE FROM documents WHERE id = ?').run(docId);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/share - Add or update collaborator (Owner only)
const shareDocSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  role: z.enum(['viewer', 'editor'], {
    errorMap: () => ({ message: "Role must be 'viewer' or 'editor'" })
  })
}).refine(data => data.userId || data.email, {
  message: 'Either userId or email must be provided'
});

router.post('/:id/share', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner') {
      return res.status(403).json({
        error: 'Permission Denied: Only the document owner can manage collaborators.'
      });
    }

    const parsed = shareDocSchema.parse(req.body);

    let targetUser: any;
    if (parsed.userId) {
      targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(parsed.userId);
    } else if (parsed.email) {
      targetUser = db.prepare('SELECT * FROM users WHERE email = ?').get(parsed.email);
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found. Please select a valid user or email.' });
    }

    if (targetUser.id === document.owner_id) {
      return res.status(400).json({ error: 'The document owner already has full access.' });
    }

    // Upsert collaborator record
    const existing = db.prepare(`
      SELECT id FROM document_collaborators 
      WHERE document_id = ? AND user_id = ?
    `).get(docId, targetUser.id) as any;

    if (existing) {
      db.prepare(`
        UPDATE document_collaborators
        SET role = ?, created_at = datetime('now')
        WHERE id = ?
      `).run(parsed.role, existing.id);
    } else {
      db.prepare(`
        INSERT INTO document_collaborators (id, document_id, user_id, role, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).run(uuidv4(), docId, targetUser.id, parsed.role);
    }

    // Return updated collaborators list
    const collaborators = db.prepare(`
      SELECT c.id, c.role, c.created_at, u.id as user_id, u.name, u.email, u.avatar_color, u.role_title
      FROM document_collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.document_id = ?
      ORDER BY c.created_at ASC
    `).all(docId);

    res.json({
      message: `Document successfully shared with ${targetUser.name} as ${parsed.role}`,
      collaborators
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id/share/:userId - Revoke access (Owner only)
router.delete('/:id/share/:targetUserId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const targetUserId = req.params.targetUserId;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner') {
      return res.status(403).json({
        error: 'Permission Denied: Only the document owner can revoke access.'
      });
    }

    db.prepare(`
      DELETE FROM document_collaborators 
      WHERE document_id = ? AND user_id = ?
    `).run(docId, targetUserId);

    const collaborators = db.prepare(`
      SELECT c.id, c.role, c.created_at, u.id as user_id, u.name, u.email, u.avatar_color, u.role_title
      FROM document_collaborators c
      JOIN users u ON c.user_id = u.id
      WHERE c.document_id = ?
      ORDER BY c.created_at ASC
    `).all(docId);

    res.json({ message: 'Collaborator access revoked', collaborators });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/versions - List version snapshots
router.get('/:id/versions', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document || !role) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const versions = db.prepare(`
      SELECT v.id, v.title, v.version_label, v.created_at, u.name as saved_by_name, u.avatar_color as saved_by_avatar
      FROM document_versions v
      JOIN users u ON v.saved_by = u.id
      WHERE v.document_id = ?
      ORDER BY datetime(v.created_at) DESC
    `).all(docId);

    res.json({ versions });
  } catch (err) {
    next(err);
  }
});

// POST /api/documents/:id/versions/:versionId/restore - Restore a version
router.post('/:id/versions/:versionId/restore', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: docId, versionId } = req.params;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: 'Permission Denied: Viewers cannot restore versions.' });
    }

    const version = db.prepare('SELECT * FROM document_versions WHERE id = ? AND document_id = ?').get(versionId, docId) as any;
    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Save a backup snapshot of current state before restoring
    db.prepare(`
      INSERT INTO document_versions (id, document_id, title, content, saved_by, version_label, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), docId, document.title, document.content, req.user.id, `Pre-restore snapshot (prior to ${version.version_label})`);

    // Restore content and title
    db.prepare(`
      UPDATE documents
      SET title = ?, content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(version.title, version.content, docId);

    res.json({
      message: `Document restored to version: ${version.version_label}`,
      title: version.title,
      content: version.content
    });
  } catch (err) {
    next(err);
  }
});

export default router;
