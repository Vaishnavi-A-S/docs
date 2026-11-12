import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { SignInPage } from './components/Auth/SignInPage';
import { GoogleDocsHeader } from './components/GoogleDocs/GoogleDocsHeader';
import { GoogleDocsDashboard } from './components/GoogleDocs/GoogleDocsDashboard';
import { GoogleDocsShareDialog } from './components/GoogleDocs/GoogleDocsShareDialog';
import { RichTextEditor } from './components/Editor/RichTextEditor';
import { AjaiaAiPanel } from './components/Ajaia/AjaiaAiPanel';
import { FileUploadModal } from './components/Modals/FileUploadModal';
import { AttachmentsDrawer } from './components/Modals/AttachmentsDrawer';
import { VersionHistoryModal } from './components/Modals/VersionHistoryModal';
import { DocumentListItem, DocumentDetail, Collaborator } from './types';
import {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument
} from './services/api';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Editor state
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useState<DocumentDetail | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [shareTargetDoc, setShareTargetDoc] = useState<{ id: string; title: string; owner: any; isOwner: boolean; collaborators: Collaborator[] } | null>(null);

  // Notification Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load documents list
  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsLoadingDocs(true);
      const docs = await getDocuments(activeTab, searchQuery);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      showToast(err.message || 'Failed to load documents', 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  }, [currentUser, activeTab, searchQuery]);

  useEffect(() => {
    if (currentUser) {
      loadDocuments();
    }
  }, [currentUser, loadDocuments]);

  // Load single document when activeDocId changes or active user changes
  const loadActiveDoc = useCallback(async (docId: string) => {
    try {
      const doc = await getDocument(docId);
      setCurrentDoc(doc);
      setSaveStatus('saved');
    } catch (err: any) {
      console.warn('Cannot open document:', err.message);
      showToast(err.message || 'Access denied to document', 'error');
      setActiveDocId(null);
      setCurrentDoc(null);
      loadDocuments();
    }
  }, [loadDocuments]);

  useEffect(() => {
    if (activeDocId && currentUser) {
      loadActiveDoc(activeDocId);
    }
  }, [activeDocId, currentUser, loadActiveDoc]);

  // If user is not signed in, show the dedicated Google Docs Sign-In page
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#00091f] text-[#97c2f8] flex flex-col items-center justify-center text-xs font-medium space-y-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#001d6b] via-[#1a73e8] to-[#97c2f8] border border-[#97c2f8]/40 animate-pulse flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
          <span className="font-bold text-sm">A</span>
        </div>
        <p className="tracking-wide">Initializing Ajaia Workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <SignInPage />;
  }

  // Document actions
  const handleOpenDoc = (id: string) => {
    setActiveDocId(id);
  };

  const handleBackToDashboard = () => {
    setActiveDocId(null);
    setCurrentDoc(null);
    loadDocuments();
  };

  const handleCreateDocument = async (template?: string) => {
    let title = 'Untitled document';
    let content = '<p></p>';

    if (template === 'strategy') {
      title = 'Project Proposal: Next-Gen AI Workspace';
      content = `
        <h1>Project Proposal: Next-Gen AI Workspace</h1>
        <p>Author: <strong>${currentUser.name}</strong> (${currentUser.role_title})</p>
        <h2>1. Executive Summary</h2>
        <p>Ajaia Docs empowers cross-functional teams to author, collaborate, and ship high-impact knowledge without friction.</p>
        <h2>2. Key Objectives</h2>
        <ul>
          <li><strong>Sub-millisecond responsiveness:</strong> Zero keystroke delay on all modern hardware.</li>
          <li><strong>Granular Role Enforcement:</strong> Explicit owner, editor, and viewer boundary controls.</li>
          <li><strong>Cross-format Portability:</strong> Import from Markdown and export to PDF.</li>
        </ul>
        <h2>3. Target Milestones</h2>
        <ol>
          <li>Phase 1: Zero-latency document canvas & persistence engine.</li>
          <li>Phase 2: Enterprise role-based access control and file attachments.</li>
        </ol>
      `;
    } else if (template === 'notes') {
      title = 'Sprint 42: Team Review & Planning Notes';
      content = `
        <h1>Sprint 42: Team Review & Planning Notes</h1>
        <p>Date: <strong>${new Date().toLocaleDateString()}</strong> • Facilitator: <strong>${currentUser.name}</strong></p>
        <h2>Agenda</h2>
        <ul>
          <li>Sprint retrospective and key achievements</li>
          <li>Technical architecture tradeoffs and AI tool evaluation</li>
          <li>Upcoming deliverables for review</li>
        </ul>
        <blockquote>"Prioritize depth in core user flows over shallow coverage everywhere."</blockquote>
      `;
    } else if (template === 'rfc') {
      title = 'RFC 104: Secure Relational Persistence Model';
      content = `
        <h1>RFC 104: Secure Relational Persistence Model</h1>
        <p>Status: <strong>PROPOSED</strong> • Author: <strong>${currentUser.name}</strong></p>
        <h2>Abstract</h2>
        <p>This technical RFC proposes an atomic persistence architecture using SQLite in Write-Ahead Logging (WAL) mode.</p>
        <pre><code>interface DocPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  canMutate: boolean;
}</code></pre>
      `;
    }

    try {
      const created = await createDocument({ title, content });
      showToast(`Created document "${created.title}"`);
      setActiveDocId(created.id);
      setCurrentDoc(created);
    } catch (err: any) {
      showToast(err.message || 'Failed to create document', 'error');
    }
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!window.confirm(`Move "${title}" to trash? This will remove access for all collaborators.`)) {
      return;
    }
    try {
      await deleteDocument(id);
      showToast(`Document "${title}" moved to trash`);
      if (activeDocId === id) {
        handleBackToDashboard();
      } else {
        loadDocuments();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  const handleRenameTitle = async (newTitle: string) => {
    if (!currentDoc) return;
    try {
      setSaveStatus('saving');
      await updateDocument(currentDoc.id, { title: newTitle });
      setCurrentDoc(prev => prev ? { ...prev, title: newTitle } : null);
      setSaveStatus('saved');
      showToast('Document title updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to rename document', 'error');
      setSaveStatus('saved');
    }
  };

  const handleSaveContent = async (htmlContent: string) => {
    if (!currentDoc) return;
    await updateDocument(currentDoc.id, { content: htmlContent });
    setCurrentDoc(prev => prev ? { ...prev, content: htmlContent } : null);
  };

  const handleInsertAiContent = async (htmlToInsert: string) => {
    if (!currentDoc) return;
    const combined = currentDoc.content ? `${currentDoc.content}\n${htmlToInsert}` : htmlToInsert;
    await handleSaveContent(combined);
    showToast('Ajaia AI generated content inserted into document');
  };

  const handleShareDocFromCard = (docItem: DocumentListItem) => {
    setShareTargetDoc({
      id: docItem.id,
      title: docItem.title,
      owner: {
        id: docItem.ownerId,
        name: docItem.ownerName,
        email: docItem.ownerEmail,
        avatar_color: docItem.ownerAvatarColor,
        role_title: 'Document Owner'
      },
      isOwner: docItem.isOwner,
      collaborators: []
    });
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#202124]">
      {/* View Switching: Either Full Google Docs Editor or Google Docs Dashboard */}
      {activeDocId && currentDoc ? (
        <div className="flex-1 flex flex-col">
          {/* Authentic Google Docs Top Bar & Menus */}
          <GoogleDocsHeader
            currentDoc={currentDoc}
            onBackToDashboard={handleBackToDashboard}
            onRenameTitle={handleRenameTitle}
            saveStatus={saveStatus}
            onOpenShareModal={() => {
              setShareTargetDoc({
                id: currentDoc.id,
                title: currentDoc.title,
                owner: currentDoc.owner,
                isOwner: currentDoc.isOwner,
                collaborators: currentDoc.collaborators
              });
              setIsShareModalOpen(true);
            }}
            onOpenAttachments={() => setIsAttachmentsOpen(true)}
            onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
            onOpenAiCopilot={() => setIsAiPanelOpen(true)}
            onNewDoc={handleCreateDocument}
            onDeleteDoc={() => handleDeleteDocument(currentDoc.id, currentDoc.title)}
          />

          {/* Authentic Google Docs Paper Canvas & Toolbar */}
          <RichTextEditor
            key={`${currentDoc.id}-${currentUser.id}`}
            initialContent={currentDoc.content}
            canEdit={currentDoc.canEdit}
            userRole={currentDoc.userRole}
            onSaveContent={handleSaveContent}
            onSaveStatusChange={setSaveStatus}
          />
        </div>
      ) : (
        /* Authentic Google Docs Dashboard Home */
        <GoogleDocsDashboard
          documents={documents}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenDoc={handleOpenDoc}
          onDeleteDoc={handleDeleteDocument}
          onShareDoc={handleShareDocFromCard}
          onNewDoc={handleCreateDocument}
          onImportClick={() => setIsUploadModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoadingDocs}
        />
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 left-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-lg border text-xs font-medium text-white ${
              toast.type === 'error'
                ? 'bg-rose-600 border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-800 border-slate-900'
                : 'bg-emerald-600 border-emerald-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-75"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Google Docs Share Dialog */}
      {isShareModalOpen && shareTargetDoc && (
        <GoogleDocsShareDialog
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setShareTargetDoc(null);
            if (activeDocId) loadActiveDoc(activeDocId);
            else loadDocuments();
          }}
          docId={shareTargetDoc.id}
          docTitle={shareTargetDoc.title}
          owner={shareTargetDoc.owner}
          isOwner={shareTargetDoc.isOwner}
          collaborators={currentDoc?.collaborators || shareTargetDoc.collaborators}
          onCollaboratorsUpdated={collabs => {
            if (currentDoc) {
              setCurrentDoc(prev => prev ? { ...prev, collaborators: collabs } : null);
            }
            showToast('Document sharing permissions updated');
          }}
        />
      )}

      {/* File Upload Ingestion Modal */}
      {isUploadModalOpen && (
        <FileUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onDocumentCreated={newDoc => {
            showToast(`Imported "${newDoc.title}" successfully!`);
            setActiveDocId(newDoc.id);
            setCurrentDoc(newDoc);
          }}
        />
      )}

      {/* Document Attachments Drawer */}
      {isAttachmentsOpen && currentDoc && (
        <AttachmentsDrawer
          isOpen={isAttachmentsOpen}
          onClose={() => setIsAttachmentsOpen(false)}
          docId={currentDoc.id}
          canEdit={currentDoc.canEdit}
          attachments={currentDoc.attachments}
          onAttachmentsUpdated={updatedAtts => {
            setCurrentDoc(prev => prev ? { ...prev, attachments: updatedAtts } : null);
            showToast('Attachments updated');
          }}
        />
      )}

      {/* Version History Modal */}
      {isVersionHistoryOpen && currentDoc && (
        <VersionHistoryModal
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
          docId={currentDoc.id}
          canEdit={currentDoc.canEdit}
          onVersionRestored={(restoredTitle, restoredContent) => {
            setCurrentDoc(prev => prev ? { ...prev, title: restoredTitle, content: restoredContent } : null);
            showToast(`Restored version: "${restoredTitle}"`);
          }}
        />
      )}

      {/* Ajaia AI Copilot Assistant Panel */}
      {isAiPanelOpen && currentDoc && (
        <AjaiaAiPanel
          isOpen={isAiPanelOpen}
          onClose={() => setIsAiPanelOpen(false)}
          documentTitle={currentDoc.title}
          documentContent={currentDoc.content}
          onInsertContent={handleInsertAiContent}
        />
      )}
    </div>
  );
};

export default App;
