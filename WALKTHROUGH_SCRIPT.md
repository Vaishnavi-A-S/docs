# Walkthrough Video Script (3-5 Minutes)
**Product:** Ajaia Docs — AI-Native Collaborative Document Editor  
**Candidate:** Vaishnavi A S (`2023vaishnavi.as@vidyashilp.edu.in`)  
**Assignment:** Ajaia LLC — AI-Native Full Stack Developer  

> 💡 **Instructions for Candidate:**  
> Use Loom, QuickTime, or OBS to record your screen while following this script.  
> Keep your webcam in the corner if possible. The script is timed for **3.5 to 4.5 minutes**.

---

### Step 1: Introduction & Problem Context (0:00 - 0:45)
**What to show on screen:** Open the browser to the Ajaia Docs Dashboard (`http://localhost:5000` or live URL).

**What to say:**
> *"Hi everyone, my name is Vaishnavi A S, and this is my submission for the Ajaia AI-Native Full Stack Developer assignment.
> 
> The challenge was to build a lightweight, collaborative document editor inspired by Google Docs within a strict 4-to-6 hour timebox. Rather than trying to build a superficial clone of every Google Docs feature, my goal was to ship a high-quality, production-ready product slice that demonstrates strong product judgment, deterministic permission boundaries, file workflows, and practical persistence."*

---

### Step 2: Document Creation & Rich-Text Editing Flow (0:45 - 1:30)
**What to show on screen:**
1. Click **"Blank Document"** from the top template bar.
2. Click the title in the top navbar and rename it to *"Q4 Product Strategy Review"*.
3. Type some text, highlight it, and apply **Bold**, **Italic**, and **Heading 1**.
4. Create a bulleted list and an indented blockquote.
5. Point out the **"Saved" status indicator** in the top navbar and the **live word counter** in the bottom right.

**What to say:**
> *"Here on the dashboard, we can start from scratch or use templates. Let's create a new blank document.
> 
> Notice that renaming is intuitive—clicking the title in the top navbar enables inline editing, and pressing Enter or clicking away triggers an immediate update.
> 
> The document canvas is rendered on a realistic Google Docs paper layout using TipTap with ProseMirror under the hood. We support standard rich text formatting: Headings 1 through 3, bold, italics, underlines, bulleted and numbered lists, blockquotes, and code blocks.
> 
> Edits are automatically saved with a debounced 1.5-second inactivity trigger, accompanied by keyboard shortcuts like Ctrl+S, while the live status in the navbar confirms that all changes are safely persisted to our SQLite database."*

---

### Step 3: File Upload & Ingestion (1:30 - 2:15)
**What to show on screen:**
1. Click the back arrow to return to the Dashboard.
2. Click **"Import File"**.
3. Select `sample-strategy.md` from the project folder.
4. Show how the Markdown is immediately converted into rich headings, lists, and bold text in the editor.
5. Click the **"Files" (Attachments)** icon in the top right.
6. Upload an attachment file, then show the download and delete capabilities.

**What to say:**
> *"Next is our file handling capability. We built a two-part file system:
> 
> First, document ingestion. If I click 'Import File' and upload this Markdown document, `sample-strategy.md`, our backend parses the file into semantic HTML, automatically derives the title, and initializes an editable document.
> 
> Second, document attachments. Users often need to associate supplementary files like PDFs, CSV spreadsheets, or research briefs with a document. By opening the Attachments drawer, I can attach any file, download it, or delete it, with all assets safely stored on the backend."*

---

### Step 4: Sharing & Granular Access Control (2:15 - 3:00)
**What to show on screen:**
1. Click the prominent blue **"Share"** button.
2. Add **Alex Rivera** as an **Editor** and **Priya Sharma** as a **Viewer**.
3. Now use the **Persona Switcher** in the top-right navbar to switch to **Priya Sharma**.
4. Show how the editor immediately switches to **"Viewing Mode"** with an amber banner, formatting tools are disabled, and editing is blocked.
5. Return to Dashboard and show the **"Shared with Me"** tab vs. **"Owned by Me"** tab.
6. Switch back to Vaishnavi or Alex to show how permissions adapt dynamically.

**What to say:**
> *"Now let's look at the sharing model. Clicking 'Share' opens our permission manager. Here, we see the document owner and can add collaborators with either 'Editor' or 'Viewer' access. Let's add Alex as an Editor and Priya as a Viewer.
> 
> To make evaluating this effortless for reviewers, I built a simulated Persona Switcher in the top right. If I switch to Priya, who is a Viewer:
> The editor immediately locks into Read-Only mode. Notice the amber alert banner informing Priya that she has view-only access. The toolbar is disabled, and any attempt to edit is rejected both on the client and enforced strictly with a 403 Forbidden on the backend.
> 
> On the dashboard, documents are visibly segregated between 'Owned by Me' and 'Shared with Me', with clear role badges on every card."*

---

### Step 5: Architecture Decisions, Scope Cuts & AI Workflow (3:00 - 4:00)
**What to show on screen:**
1. Show the `ARCHITECTURE.md` and `AI_WORKFLOW.md` files or test results in terminal (`npm test` showing 16 passing tests).

**What to say:**
> *"Under the hood, the backend is built with Node.js, Express, TypeScript, and SQLite running with Write-Ahead Logging for high concurrency and relational integrity.
> 
> Regarding prioritization and scope cuts: I intentionally deprioritized WebSockets and real-time multiplayer CRDTs. In a 4-to-6 hour timebox, CRDTs introduce synchronization bugs and race conditions. Prioritizing deterministic HTTP persistence, granular role enforcement, automated version snapshots, and 16 integration tests delivered a vastly more reliable product.
> 
> In terms of AI tooling, I utilized Gemini and Copilot to accelerate database schema drafting, TipTap configuration, and automated test scaffolding. Crucially, I rejected AI recommendations when they proposed loose client-side authorization and instead mandated strict backend verification.
> 
> Everything is fully tested, documented in README.md, and ready for review. Thank you for your time and consideration!"*
