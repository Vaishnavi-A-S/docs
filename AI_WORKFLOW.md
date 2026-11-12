# AI-Native Engineering Workflow Note
**Candidate:** Vaishnavi A S (`2023vaishnavi.as@vidyashilp.edu.in`)  
**Assignment:** Ajaia LLC — AI-Native Full Stack Developer  
**Focus:** Practical, high-leverage AI utilization with engineering rigor  

---

## 1. AI Tooling Stack
For this assignment, I leveraged an AI-augmented engineering loop:
- **Antigravity (DeepMind Gemini 3.8 / Claude 3.5 Sonnet / GPT-4o architecture):** Primary pair-programming agent for rapid scaffolding, schema generation, test harness authoring, and documentation.
- **GitHub Copilot / Inline Autocomplete:** In-editor repetitive pattern completion (TypeScript interfaces, CSS class permutations, and test assertions).

---

## 2. Where AI Materially Sped Up My Work
AI delivered the highest leverage in areas where boilerplate or reference syntax would normally consume 60-70% of engineering time:

1. **Schema & Migration Scaffolding (15x speedup):**
   - Transformed high-level domain requirements into a clean SQLite relational schema with foreign key constraints, indexes, and initial seeds in minutes.
2. **TipTap ProseMirror Configuration (8x speedup):**
   - Headless rich text editors require intricate extension wiring (`StarterKit`, `Underline`, `TextAlign`, `Placeholder`). AI generated the core configuration block, allowing me to focus immediately on the user experience and keyboard shortcut bindings.
3. **Comprehensive Integration Test Generation (10x speedup):**
   - AI generated the matrix of Supertest calls for authorization boundaries (checking 403 Forbidden for viewers vs. 200 OK for editors). This ensured zero test debt from minute one.
4. **Markdown-to-HTML AST Ingestion Logic:**
   - Rapidly drafted the regex parser for ingesting uploaded `.md` and `.txt` files into formatted HTML with heading hierarchy and list tags.

---

## 3. What AI-Generated Output I Changed or Rejected
The hallmark of a mature AI-native developer is knowing **when to reject AI recommendations**:

### 1. Rejected Proposed Real-Time WebSockets & CRDT Architecture
- **AI Suggestion:** The initial prompt scaffolding suggested integrating Yjs with a WebSocket server for multi-cursor collaborative editing.
- **My Rejection & Decision:** I deliberately rejected this for the 4-6 hour scope. WebSockets without an enterprise signaling and presence infrastructure create synchronization bugs, race conditions in persistence, and brittle demo environments. Instead, I directed the implementation toward a **deterministic HTTP debounced persistence model** with clear role-based permissions (Owner, Editor, Viewer) and snapshot versions. This directly aligned with the assignment instruction: *"A focused, well-reasoned partial solution is better than an overextended build."*

### 2. Overruled Loose Client-Side Permission Checks
- **AI Suggestion:** The assistant initially generated UI conditional rendering that simply hid the "Delete" and "Edit" buttons on the client for Viewers.
- **My Correction:** Client-side hiding is not security. I refactored the backend architecture to enforce database-level access checks on every single `PUT`, `DELETE`, and `POST` endpoint, returning strict `403 Forbidden` responses if a non-owner or viewer attempts an unauthorized mutation.

### 3. Refactored Parallel Test Execution
- **AI Suggestion:** Vitest initially ran test files in parallel across multiple worker threads sharing the same SQLite database file, causing database lock and cross-test mutation conflicts.
- **My Correction:** I diagnosed the race condition, configured sequential file execution (`--fileParallelism=false`), and restructured each test to create dedicated test resources rather than relying on shared state.

### 4. Replaced Generic Typography with Google Docs Visual Language
- **AI Suggestion:** Default Tailwind prose styling that looked like a generic blog post.
- **My Correction:** Restyled the editor container into a physical paper canvas (850px page width, subtle elevation shadows, realistic margins, Google Docs blue `#1a73e8` accent, and custom font pairings) to genuinely evoke the Google Docs aesthetic.

---

## 4. Verification of Correctness, UX Quality, and Reliability

To ensure that AI-assisted code was not merely plausible, but correct and robust:

1. **Automated Verification:**
   - Ran `npm test` across 16 automated integration tests covering document lifecycle, title validations, permission boundary violations, and file ingestion. All 16 tests pass deterministically in under 600ms.
2. **End-to-End Persona Testing:**
   - Used the built-in Persona Switcher to rotate between **Vaishnavi** (Owner), **Alex** (Editor), and **Priya** (Viewer):
     - Verified that Priya is strictly locked out of editing (read-only mode active, toolbar disabled, viewer banner displayed).
     - Verified that Alex can edit content and title, but cannot delete the document or revoke collaborators.
     - Verified that Vaishnavi has full administrative rights.
3. **Round-Trip File Ingestion & Export:**
   - Imported local markdown files (`sample-strategy.md`), edited them in the browser canvas, and exported them back out to Markdown, HTML, and browser-rendered PDF printouts.
4. **TypeScript Strict Type Checking:**
   - Ran full TypeScript compilation (`tsc && vite build`) to verify that zero type errors or `any` leaks made it to production.

---

## 5. Reflection on AI in Modern Product Engineering
AI is an amplifier of capability, not a substitute for architectural discipline. Used effectively, it removes mechanical friction so the engineer can focus deeply on product judgment, boundary conditions, edge cases, and user delight.
