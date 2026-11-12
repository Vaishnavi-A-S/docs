# Assignment Submission Package
**Company:** Ajaia LLC  
**Role:** AI-Native Full Stack Developer  
**Candidate:** Vaishnavi A S  
**Email:** `2023vaishnavi.as@vidyashilp.edu.in`  
**Date of Submission:** November 12, 2026  

---

## 1. Executive Checklist & Deliverables

| Deliverable | Status | Location / Reference |
| :--- | :---: | :--- |
| **Full Source Code** | ✅ Complete | Complete repository (`server/`, `client/`, `package.json`) |
| **Comprehensive README** | ✅ Complete | [`README.md`](./README.md) with step-by-step setup and test instructions |
| **System Architecture Note** | ✅ Complete | [`ARCHITECTURE.md`](./ARCHITECTURE.md) (design, data model, tradeoffs) |
| **AI Workflow Note** | ✅ Complete | [`AI_WORKFLOW.md`](./AI_WORKFLOW.md) (tools used, speedups, rejected outputs) |
| **Submission Manifest** | ✅ Complete | This file ([`SUBMISSION.md`](./SUBMISSION.md)) |
| **Walkthrough Video Script** | ✅ Complete | [`WALKTHROUGH_SCRIPT.md`](./WALKTHROUGH_SCRIPT.md) (3-5 min script) |
| **Video Recording Link** | 🔗 Attached | `VIDEO_URL.txt` (Placeholder for Loom / Unlisted YouTube link) |
| **16 Automated Tests** | ✅ Complete | Passing integration test suite (`npm test`) |
| **Sample Test File** | ✅ Complete | [`sample-strategy.md`](./sample-strategy.md) for instant import testing |

---

## 2. Seeded Test Accounts Reference
To make evaluation frictionless, the application includes a **top-right Persona Switcher** and pre-seeded database accounts. No password typing or complex auth setup required:

| User Account | Name | Seeded Role / Title | Testing Purpose |
| :--- | :--- | :--- | :--- |
| `user-vaishnavi` | **Vaishnavi A S** (Default) | Lead Candidate & Author | Test owner permissions, document creation, and sharing. |
| `user-alex` | **Alex Rivera** | Product Reviewer | Test **Editor** role: can edit shared documents, cannot delete or change ownership. |
| `user-priya` | **Priya Sharma** | Senior Tech Lead | Test **Viewer** role: read-only mode, disabled toolbar, 403 Forbidden on write. |
| `user-sam` | **Sam Taylor** | UX Designer | Test unauthorized / non-collaborator access restrictions. |

---

## 3. Local Setup & Quick Run Instructions

The application is structured for instant evaluation with zero external dependencies:

```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Run automated integration test suite (16 tests)
npm test

# 3. Seed sample documents and test accounts
npm run seed

# 4. Build client & start production server on single port (http://localhost:5000)
npm run build
npm start

# Or for concurrent hot-reload development:
npm run dev
```

---

## 4. Live Deployment Guidance

The single-process architecture allows the entire full-stack app (client static bundle + API) to run from `npm start` on port 5000:
- **Render / Railway / Fly.io / Heroku:** Build command: `npm run build`, Start command: `npm start`.
- **Local Tunnel / Ngrok (for instant remote reviewer testing):**
  ```bash
  npx localtunnel --port 5000
  # or
  ngrok http 5000
  ```

---

## 5. Scope Analysis: Working vs. Deprioritized

### What is Working End-to-End
1. **Document Lifecycle:** Create, inline rename, rich-text format, auto-save (debounced 1.5s), manual save (`Ctrl+S`), and delete.
2. **Rich Text Formatting:** Headings (H1-H3), bold, italic, underline, strikethrough, bulleted lists, numbered lists, blockquotes, code blocks, text alignment.
3. **File Ingestion:** Upload `.md`, `.txt`, `.html`, or `.json` to create a new editable document with converted formatting.
4. **Document Attachments:** Upload supplementary files (PDFs, spreadsheets, images) associated with any document, with download and removal.
5. **Granular Sharing Model:** Explicit owner, editor, and viewer roles with database-enforced permissions and visible UI segregation ("Owned by Me" vs. "Shared with Me").
6. **Persistence & Integrity:** Relational SQLite with WAL mode, foreign key cascades, and transactional safety.
7. **Version History:** Snapshot revisions with one-click restore.
8. **Export:** Export documents to Markdown, HTML, or browser-printed PDF.
9. **Automated Quality:** 16 Vitest integration tests covering documents, sharing authorization, and file ingestion.

### What Was Intentionally Deprioritized & Scope Cuts
- **Multi-user Real-time WebSockets / CRDTs:** Deprioritized to maintain extreme reliability within the 4-6 hour constraint. A rock-solid HTTP debounced persistence engine was prioritized over a buggy WebSocket implementation.
- **Rich Collaborative Inline Comments:** Deprioritized in favor of rock-solid document attachments and version snapshots.
- **OAuth / Google SSO:** Seeded switchable accounts were chosen to provide zero-friction testing for reviewers without requiring OAuth API credentials.

### What I Would Build Next with Another 2-4 Hours
1. **Live Presence & Real-Time Collaborative Sync:** Introduce Yjs over WebSockets for live cursor presence and character-by-character concurrent edits.
2. **Inline Commenting & Suggestion Mode:** Allow collaborators to highlight text spans and leave threaded discussions.
3. **Diff View for Version History:** Visual side-by-side or inline git-style green/red diff comparison when viewing past revisions.
4. **Folder & Tag Organization:** Nested hierarchical collections and tagging for organizing enterprise document workspaces.
