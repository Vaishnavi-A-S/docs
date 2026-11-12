import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DashboardHeader } from './components/Dashboard/DashboardHeader';
import { DocumentList } from './components/Dashboard/DocumentList';
import { RichTextEditor } from './components/Editor/RichTextEditor';
import { ShareModal } from './components/Modals/ShareModal';
import { FileUploadModal } from './components/Modals/FileUploadModal';
import { AttachmentsDrawer } from './components/Modals/AttachmentsDrawer';
import { VersionHistoryModal } from './components/Modals/VersionHistoryModal';
import { DocumentListItem, DocumentDetail, Collaborator, Attachment } from './types';
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
    loadDocuments();
  }, [loadDocuments]);

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
    if (activeDocId) {
      loadActiveDoc(activeDocId);
    }
  }, [activeDocId, currentUser, loadActiveDoc]);

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
    let title = 'Untitled Document';
    let content = '<p></p>';

    if (template === 'strategy') {
      title = 'Product Strategy & Vision';
      content = `
        <h1>Product Strategy & Vision</h1>
        <p>Target customer persona, key user friction points, and proposed technical architecture.</p>
        <h2>Executive Summary</h2>
        <p>Outline the 30-day velocity targets and customer success metrics.</p>
        <h2>Success Metrics</h2>
        <ul>
          <li>70% reduction in document friction</li>
          <li>Sub-100ms editor responsiveness</li>
        </ul>
      `;
    } else if (template === 'rfc') {
      title = 'RFC: Distributed Collaboration Model';
      content = `
        <h1>RFC: Distributed Collaboration Model</h1>
        <p>Author: <strong>${currentUser?.name}</strong></p>
        <h2>Context & Background</h2>
        <p>Architectural proposal for lightweight collaborative document syncing.</p>
        <h2>Proposed Implementation</h2>
        <pre><code>interface SyncEvent {
  docId: string;
  version: number;
  patch: string;
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
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteDocument(id);
      showToast(`Document "${title}" deleted`);
      loadDocuments();
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
      showToast('Document title renamed');
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
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentDoc={currentDoc}
        onBackToDashboard={handleBackToDashboard}
        onRenameTitle={handleRenameTitle}
        saveStatus={saveStatus}
        onOpenShareModal={() => {
          if (currentDoc) {
            setShareTargetDoc({
              id: currentDoc.id,
              title: currentDoc.title,
              owner: currentDoc.owner,
              isOwner: currentDoc.isOwner,
              collaborators: currentDoc.collaborators
            });
            setIsShareModalOpen(true);
          }
        }}
        onOpenAttachments={() => setIsAttachmentsOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeDocId && currentDoc ? (
          /* Editor View */
          <RichTextEditor
            key={`${currentDoc.id}-${currentUser?.id}`}
            initialContent={currentDoc.content}
            canEdit={currentDoc.canEdit}
            userRole={currentDoc.userRole}
            onSaveContent={handleSaveContent}
            onSaveStatusChange={setSaveStatus}
          />
        ) : (
          /* Dashboard Home View */
          <div>
            <DashboardHeader
              onNewDoc={handleCreateDocument}
              onImportClick={() => setIsUploadModalOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <DocumentList
              documents={documents}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenDoc={handleOpenDoc}
              onDeleteDoc={handleDeleteDocument}
              onShareDoc={handleShareDocFromCard}
              onNewDoc={() => handleCreateDocument()}
              isLoading={isLoadingDocs}
            />
          </div>
        )}
      </main>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 left-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-medium text-white ${
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

      {/* Modals */}
      {isShareModalOpen && shareTargetDoc && (
        <ShareModal
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
    </div>
  );
};

export default App;
