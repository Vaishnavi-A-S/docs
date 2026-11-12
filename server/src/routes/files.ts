import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { getDocAccess } from './documents.js';

const router = Router();

// Ensure upload directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

// Configure upload limits & filter
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Helper: Convert raw Markdown or plaintext to rich HTML
function parseFileToHtml(rawContent: string, ext: string): string {
  if (ext === '.html' || ext === '.htm') {
    return rawContent;
  }

  // Basic robust Markdown parser for document ingestion
  const lines = rawContent.split(/\r?\n/);
  const htmlOutput: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        htmlOutput.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
      continue;
    }

    // Close open list if line is empty or not list
    const isBullet = /^\s*[-*+]\s+(.*)$/.test(line);
    const isNumber = /^\s*\d+\.\s+(.*)$/.test(line);

    if (!isBullet && !isNumber && inList) {
      htmlOutput.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }

    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      htmlOutput.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      htmlOutput.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      htmlOutput.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('> ')) {
      htmlOutput.push(`<blockquote><p>${formatInline(line.slice(2))}</p></blockquote>`);
    } else if (isBullet) {
      if (!inList) {
        htmlOutput.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const itemText = line.replace(/^\s*[-*+]\s+/, '');
      htmlOutput.push(`<li>${formatInline(itemText)}</li>`);
    } else if (isNumber) {
      if (!inList) {
        htmlOutput.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const itemText = line.replace(/^\s*\d+\.\s+/, '');
      htmlOutput.push(`<li>${formatInline(itemText)}</li>`);
    } else {
      htmlOutput.push(`<p>${formatInline(line)}</p>`);
    }
  }

  if (inList) {
    htmlOutput.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  return htmlOutput.join('\n');
}

function formatInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// POST /api/files/import - Upload file to create brand new document
router.post('/import', upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided for import' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowedExtensions = ['.txt', '.md', '.markdown', '.html', '.htm', '.json'];

    if (!allowedExtensions.includes(ext)) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: `Unsupported file format '${ext}'. Supported file formats for document creation: .md, .txt, .html, .json`
      });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const parsedHtml = parseFileToHtml(fileContent, ext);

    // Clean up temporary imported file
    fs.unlinkSync(req.file.path);

    // Derive document title from filename
    const baseName = path.basename(req.file.originalname, ext)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    const docTitle = baseName || 'Imported Document';

    const newDocId = `doc-${uuidv4()}`;

    // Insert into database
    db.prepare(`
      INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(newDocId, docTitle, parsedHtml, req.user.id);

    // Save initial version
    db.prepare(`
      INSERT INTO document_versions (id, document_id, title, content, saved_by, version_label, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(uuidv4(), newDocId, docTitle, parsedHtml, req.user.id, `Imported from ${req.file.originalname}`);

    const createdDoc = db.prepare(`
      SELECT d.*, u.name as owner_name, u.email as owner_email, u.avatar_color as owner_avatar_color
      FROM documents d
      JOIN users u ON d.owner_id = u.id
      WHERE d.id = ?
    `).get(newDocId) as any;

    res.status(201).json({
      message: `Successfully imported '${req.file.originalname}' into new document!`,
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

// POST /api/documents/:id/attachments - Attach file to an existing document
router.post('/documents/:id/attachments', upload.single('attachment'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = req.params.id;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner' && role !== 'editor') {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Permission Denied: Viewers cannot attach files.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No attachment file provided' });
    }

    const attachmentId = `att-${uuidv4()}`;

    db.prepare(`
      INSERT INTO document_attachments (id, document_id, filename, original_name, mime_type, size_bytes, file_path, uploaded_by, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      attachmentId,
      docId,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      req.file.path,
      req.user.id
    );

    const attachments = db.prepare(`
      SELECT a.*, u.name as uploader_name
      FROM document_attachments a
      JOIN users u ON a.uploaded_by = u.id
      WHERE a.document_id = ?
      ORDER BY a.created_at DESC
    `).all(docId);

    res.status(201).json({
      message: `File '${req.file.originalname}' attached successfully`,
      attachments
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/documents/:id/attachments/:attachmentId/download - Download file attachment
router.get('/documents/:id/attachments/:attachmentId/download', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: docId, attachmentId } = req.params;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document || !role) {
      return res.status(403).json({ error: 'Access denied to document' });
    }

    const attachment = db.prepare('SELECT * FROM document_attachments WHERE id = ? AND document_id = ?').get(attachmentId, docId) as any;
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'File on disk not found' });
    }

    res.download(attachment.file_path, attachment.original_name);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/documents/:id/attachments/:attachmentId - Remove attachment
router.delete('/documents/:id/attachments/:attachmentId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: docId, attachmentId } = req.params;
    const { role, document } = getDocAccess(docId, req.user.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (role !== 'owner' && role !== 'editor') {
      return res.status(403).json({ error: 'Permission Denied: Viewers cannot delete attachments.' });
    }

    const attachment = db.prepare('SELECT * FROM document_attachments WHERE id = ? AND document_id = ?').get(attachmentId, docId) as any;
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    if (fs.existsSync(attachment.file_path)) {
      try {
        fs.unlinkSync(attachment.file_path);
      } catch (e) {
        console.warn('Could not unlink attachment file:', e);
      }
    }

    db.prepare('DELETE FROM document_attachments WHERE id = ?').run(attachmentId);

    const attachments = db.prepare(`
      SELECT a.*, u.name as uploader_name
      FROM document_attachments a
      JOIN users u ON a.uploaded_by = u.id
      WHERE a.document_id = ?
      ORDER BY a.created_at DESC
    `).all(docId);

    res.json({ message: 'Attachment deleted successfully', attachments });
  } catch (err) {
    next(err);
  }
});

export default router;
