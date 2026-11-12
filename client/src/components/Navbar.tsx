import React, { useState, useEffect } from 'react';
import { UserSwitcher } from './UserSwitcher';
import { DocumentDetail } from '../types';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Clock,
  Paperclip,
  Share2,
  Download,
  Printer,
  ChevronDown,
  Lock,
  Edit2
} from 'lucide-react';

interface NavbarProps {
  currentDoc: DocumentDetail | null;
  onBackToDashboard: () => void;
  onRenameTitle?: (newTitle: string) => Promise<void>;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  onOpenShareModal?: () => void;
  onOpenAttachments?: () => void;
  onOpenVersionHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDoc,
  onBackToDashboard,
  onRenameTitle,
  saveStatus = 'saved',
  onOpenShareModal,
  onOpenAttachments,
  onOpenVersionHistory
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [showFileMenu, setShowFileMenu] = useState(false);

  useEffect(() => {
    if (currentDoc) {
      setDocTitle(currentDoc.title);
    }
  }, [currentDoc]);

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (!currentDoc || !onRenameTitle) return;
    const trimmed = docTitle.trim();
    if (trimmed && trimmed !== currentDoc.title) {
      await onRenameTitle(trimmed);
    } else {
      setDocTitle(currentDoc.title);
    }
  };

  const handleExportMarkdown = () => {
    if (!currentDoc) return;
    const blob = new Blob([currentDoc.content.replace(/<[^>]+>/g, '\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handleExportHtml = () => {
    if (!currentDoc) return;
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${currentDoc.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;}</style></head><body><h1>${currentDoc.title}</h1>${currentDoc.content}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setShowFileMenu(false);
  };

  const handlePrintPdf = () => {
    setShowFileMenu(false);
    window.print();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left side: Brand or Document Title */}
      <div className="flex items-center gap-3">
        {currentDoc ? (
          <>
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Documents Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                {currentDoc.canEdit ? (
                  isEditingTitle ? (
                    <input
                      type="text"
                      value={docTitle}
                      onChange={e => setDocTitle(e.target.value)}
                      onBlur={handleTitleSubmit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleTitleSubmit();
                        if (e.key === 'Escape') {
                          setDocTitle(currentDoc.title);
                          setIsEditingTitle(false);
                        }
                      }}
                      autoFocus
                      className="text-base font-bold text-slate-800 px-1 py-0.5 border border-blue-500 rounded focus:outline-none bg-blue-50/30"
                    />
                  ) : (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="group flex items-center gap-1.5 text-base font-bold text-slate-800 hover:bg-slate-100 px-1.5 py-0.5 rounded transition-colors"
                      title="Click to rename document"
                    >
                      <span className="truncate max-w-xs sm:max-w-md">{docTitle}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 text-base font-bold text-slate-800 px-1.5 py-0.5">
                    <span className="truncate max-w-xs sm:max-w-md">{docTitle}</span>
                    <span title="Read-only document">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                    </span>
                  </div>
                )}

                {/* Save status badge */}
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                  {saveStatus === 'saving' ? (
                    <span className="flex items-center gap-1 text-blue-600">
                      <CloudUpload className="w-3.5 h-3.5 animate-bounce" /> Saving...
                    </span>
                  ) : saveStatus === 'unsaved' ? (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      ● Unsaved edits
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Sub-menu bar */}
              <div className="flex items-center gap-2 text-xs text-slate-600 relative">
                <div className="relative">
                  <button
                    onClick={() => setShowFileMenu(!showFileMenu)}
                    className="hover:bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 text-slate-700"
                  >
                    <span>File</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showFileMenu && (
                    <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40">
                      <button
                        onClick={handleExportMarkdown}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" /> Export Markdown (.md)
                      </button>
                      <button
                        onClick={handleExportHtml}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" /> Export HTML (.html)
                      </button>
                      <button
                        onClick={handlePrintPdf}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" /> Print / Save as PDF
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500">
                  Owner: {currentDoc.isOwner ? 'You' : currentDoc.owner.name}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base tracking-tight">Ajaia Docs</h1>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Full Stack
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Assignment Candidate: <strong>Vaishnavi A S</strong> (vidyashilp.edu.in)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {currentDoc && (
          <>
            {/* Version History */}
            <button
              onClick={onOpenVersionHistory}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Version History"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">History</span>
            </button>

            {/* Attachments */}
            <button
              onClick={onOpenAttachments}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 relative"
              title="Document Attachments"
            >
              <Paperclip className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Files</span>
              {currentDoc.attachments.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {currentDoc.attachments.length}
                </span>
              )}
            </button>

            {/* Share Button (Google Docs style) */}
            <button
              onClick={onOpenShareModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              title="Share Document"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
              {currentDoc.collaborators.length > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  {currentDoc.collaborators.length + 1}
                </span>
              )}
            </button>

            <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
          </>
        )}

        {/* User Persona Switcher */}
        <UserSwitcher />
      </div>
    </header>
  );
};
