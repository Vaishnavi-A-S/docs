# Ajaia Docs — AI-Native Collaborative Document Editor
**Assignment:** AI-Native Full Stack Developer  
**Candidate:** Vaishnavi A S (`2023vaishnavi.as@vidyashilp.edu.in`)  
**Target Organization:** Ajaia LLC  

[![Tests](https://img.shields.io/badge/tests-16%20passed-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/stack-React%2018%20%7C%20Node%2020%20%7C%20TypeScript%20%7C%20SQLite-blue.svg)]()
[![Architecture](https://img.shields.io/badge/architecture-WAL%20Relational%20Store-purple.svg)]()

### 🌐 Live Demo: **[https://ajaia-docs-86qh.onrender.com](https://ajaia-docs-86qh.onrender.com)**

> **Note:** Hosted on Render's free tier — the first load after inactivity may take ~30–50 seconds while the server wakes up. Demo data resets on each restart.

> A lightweight, responsive, and permission-aware document workspace inspired by Google Docs, built within a focused 4–6 hour delivery timebox demonstrating full-stack engineering, clear prioritization, and AI-native craftsmanship.

---

## 📑 Table of Contents
1. [Core Capabilities](#-core-capabilities)
2. [Tech Stack](#-tech-stack)
3. [Quickstart & Local Setup](#-quickstart--local-setup)
4. [Automated Testing](#-automated-testing)
5. [Seeded Test Accounts & Sharing Review](#-seeded-test-accounts--sharing-review)
6. [File Upload & Ingestion](#-file-upload--ingestion)
7. [API Specification](#-api-specification)
8. [Architecture & AI Workflow Notes](#-architecture--ai-workflow-notes)
9. [Deployment Options](#-deployment-options)

---

## 🌟 Core Capabilities

### 1. Document Creation & Rich Text Editing
- **Interactive Document Canvas:** Modeled after Google Docs' paper layout (centered, subtle elevation shadows, realistic page margins).
- **Inline Title Renaming:** Click-to-rename with debounced persistence and keyboard navigation.
- **Rich Formatting Engine:** Powered by TipTap (ProseMirror):
  - Headings (H1, H2, H3)
  - Bold, Italic, Underline, Strikethrough
  - Bulleted and numbered lists
  - Blockquotes and code blocks
  - Text alignment (Left, Center, Right)
- **Persistence & Auto-Save:** Debounced 1.5-second auto-save with real-time cloud sync indicator and manual `Ctrl+S` / `Cmd+S` trigger.
- **Live Document Stats:** Word counter, character counter, and estimated reading time.

### 2. File Upload & Ingestion
- **Document Ingestion:** Upload `.md`, `.txt`, `.html`, or `.json` to create a new editable document with converted headings, lists, and formatting.
- **Document Attachments:** Attach supplementary assets (PDFs, spreadsheets, images up to 15MB) with download and delete controls.
- **Round-Trip Export:** Download documents as Markdown (`.md`), HTML (`.html`), or browser-rendered PDF printouts.

### 3. Granular Sharing & Role-Based Access
- **Ownership Model:** Every document has a primary owner with full administrative rights.
- **Role Differentiation:**
  - **Owner:** Full edit, rename, share management, attachment management, and deletion.
  - **Editor:** Can edit content, rename, upload attachments, and save versions. Cannot delete or change sharing.
  - **Viewer:** Read-only mode. Toolbar is disabled, warning banner displayed, and API rejects mutations with `403 Forbidden`.
- **Visual Segregation:** Dedicated tabs for **"Owned by Me"** vs. **"Shared with Me"** with role indicator badges.
- **Simulated Persona Switcher:** Top-right switcher to effortlessly evaluate permission boundaries as different users without typing passwords.

### 4. Version History (Stretch Feature)
- Automatic and manual version snapshots recording title, content, author, and timestamp.
- One-click restore restoring previous revisions while saving a safety snapshot of current work.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, TipTap (ProseMirror), Lucide React |
| **Backend** | Node.js 20, Express, TypeScript, Zod, Multer |
| **Database** | SQLite with `better-sqlite3` in Write-Ahead Logging (`WAL`) mode |
| **Testing** | Vitest, Supertest (16 automated tests) |
| **Build & Tooling**| Concurrently, tsx, PostCSS, Autoprefixer |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
cd ajiaji

# Install root, server, and client dependencies in one command
npm run install:all
```

### 2. Seed Initial Data
Populate the SQLite database with 4 seeded users and rich initial documents:
```bash
npm run seed
```

### 3. Run Development Server
Start both frontend and backend concurrently with hot-reloading:
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`

### 4. Or Run Single-Port Production Build
Build the client and serve both static assets and API from Express:
```bash
npm run build
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 🧪 Automated Testing

A comprehensive integration test suite verifies document CRUD, access controls, role permissions, and file handling:

```bash
npm test
```

### What the 16 Tests Cover:
1. **Document Lifecycle (`tests/documents.test.ts`):**
   - List accessible documents with correct metadata
   - Create document with valid title
   - Reject empty titles with 400 Validation Error
   - Fetch document by ID
   - Rename and update content
   - Delete document by owner
2. **Access Control & Permissions (`tests/sharing.test.ts`):**
   - Reject unauthorized users with `403 Forbidden`
   - Owner shares document with Alex as `editor`
   - Alex (`editor`) edits content successfully
   - Alex (`editor`) is rejected when attempting to delete (`403 Forbidden`)
   - Owner shares document with Priya as `viewer`
   - Priya (`viewer`) is rejected when attempting to edit content (`403 Forbidden`)
   - Owner revokes collaborator access and revokes permissions
3. **File Handling (`tests/files.test.ts`):**
   - Ingest Markdown file, convert AST to HTML headings/lists, and create document
   - Reject unsupported file extensions for ingestion
   - Attach file to existing document and retrieve attachment record

---

## 👥 4 Seeded Team Accounts & Sign-In Page

The application includes an **Enterprise Sign-In Page** with one-click persona cards and manual email login:

| Account ID | Name | Corporate Email | Seeded Role & Department | Password | How to Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user-vaishnavi` | **Vaishnavi A S** | `vaishnavi@ajaia.io`<br>*(alias: `2023vaishnavi.as@vidyashilp.edu.in`)* | Lead Product Engineer<br>*(Product & Core)* | `password123` | Default Owner. Test document creation, editing, file attachments, and sharing. |
| `user-alex` | **Alex Rivera** | `alex.rivera@ajaia.io` | Director of Product<br>*(Evaluation Team)* | `password123` | Test **Editor** role: can edit shared documents, cannot delete or change ownership. |
| `user-priya` | **Priya Sharma** | `priya.sharma@ajaia.io` | Staff Systems Architect<br>*(Platform Eng)* | `password123` | Test **Viewer** role: read-only mode, disabled toolbar, 403 Forbidden on write. |
| `user-marcus` | **Marcus Chen** | `marcus.chen@ajaia.io` | Security & Compliance Lead<br>*(Information Security)* | `password123` | Test non-collaborator access restrictions and policy boundaries. |

> 💡 **Sign-In Flow:** When launching the app, you can click on any of the 4 team cards to sign in instantly, or enter their email and password (`password123`). In the top-right profile avatar menu, click **"Sign out of workspace"** anytime to return to the Sign-In page!

---

## 📂 File Upload & Ingestion

### Supported Formats for Document Ingestion:
- **Markdown (`.md`, `.markdown`):** Headings `#`, `##`, `###`, bold `**`, italic `*`, bulleted `-`, numbered `1.`, blockquotes `>`, and code blocks are converted into rich text.
- **Plain Text (`.txt`):** Ingested line-by-line into formatted paragraphs.
- **HTML (`.html`, `.htm`):** Ingested directly into rich document canvas.
- **JSON (`.json`):** Formatted and ingested.

> 💡 **Try it instantly:** A sample file [`sample-strategy.md`](./sample-strategy.md) is included in the project root. Click **"Import File"** on the dashboard and select this file to test ingestion!

### Supported Formats for Document Attachments:
- Any file type up to **15MB** (PDF, DOCX, CSV, PNG, JPG, ZIP).
- Associated with the open document, downloadable by all collaborators, removable by owners and editors.

---

## 🔌 API Specification

All endpoints support authentication via the `x-user-id` header (or `?userId=` query parameter):

### Users
- `GET /api/users` — List all seeded users
- `GET /api/users/me` — Get current active user

### Documents
- `GET /api/documents?tab=all|owned|shared&search=...` — List accessible documents
- `POST /api/documents` — Create document `{ title, content? }`
- `GET /api/documents/:id` — Get document details, collaborators, and attachments
- `PUT /api/documents/:id` — Update title/content (Owner & Editor only)
- `DELETE /api/documents/:id` — Delete document (Owner only)
- `POST /api/documents/:id/share` — Grant access `{ userId?, email?, role: 'editor' | 'viewer' }` (Owner only)
- `DELETE /api/documents/:id/share/:userId` — Revoke access (Owner only)

### Files & Attachments
- `POST /api/files/import` — Ingest `.md`/`.txt` file into new document
- `POST /api/files/documents/:id/attachments` — Upload attachment file
- `GET /api/files/documents/:id/attachments/:attachmentId/download` — Download attachment
- `DELETE /api/files/documents/:id/attachments/:attachmentId` — Remove attachment

### Version Snapshots
- `GET /api/documents/:id/versions` — List version history snapshots
- `POST /api/documents/:id/versions/:versionId/restore` — Restore document to previous version

---

## 📖 Architecture & AI Workflow Notes
- **System Architecture & Tradeoffs:** Detailed in [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **AI-Native Workflow & Output Verification:** Detailed in [`AI_WORKFLOW.md`](./AI_WORKFLOW.md)
- **Submission Manifest & Scope Analysis:** Detailed in [`SUBMISSION.md`](./SUBMISSION.md)
- **Walkthrough Video Script:** Detailed in [`WALKTHROUGH_SCRIPT.md`](./WALKTHROUGH_SCRIPT.md)

---

## 🚢 Deployment Options

The project includes an integrated production build where Express serves the compiled React client:

### 1. One-Click Deploy on Render (Recommended)

**Live deployment:** [https://ajaia-docs-86qh.onrender.com](https://ajaia-docs-86qh.onrender.com)
This repository includes a native [`render.yaml`](./render.yaml) blueprint specification:
1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository (`https://github.com/Vaishnavi-A-S/docs.git`).
4. Render automatically parses `render.yaml`:
   - **Environment:** Node.js 20+
   - **Build Command:** `npm run build:render`
   - **Start Command:** `npm start`
   - **Health Check:** `/api/health`
5. Click **Apply**. Render will build and deploy the app with automatic database initialization and persona seeding.

*(Alternatively, you can create a **Web Service** manually using the same build and start commands).*

### 2. Deploy to Railway or Fly.io
- **Build Command:** `npm run build:render`
- **Start Command:** `npm start`
- **Port:** Handled dynamically via `process.env.PORT`
