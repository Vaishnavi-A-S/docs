import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DocumentDetail } from '../../types';
import {
  FileText,
  Star,
  FolderInput,
  CloudUpload,
  Lock,
  Share2,
  Download,
  Printer,
  History,
  Paperclip,
  LogOut,
  ChevronDown,
  Sparkles,
  Users,
  Check,
  Trash2,
  FilePlus,
  Copy,
  Scissors,
  CheckSquare,
  ShieldCheck
} from 'lucide-react';

interface GoogleDocsHeaderProps {
  currentDoc: DocumentDetail;
  onBackToDashboard: () => void;
  onRenameTitle: (newTitle: string) => Promise<void>;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  onOpenShareModal: () => void;
  onOpenAttachments: () => void;
  onOpenVersionHistory: () => void;
  onOpenAiCopilot: () => void;
  onNewDoc: (template?: string) => void;
  onDeleteDoc: () => void;
}

export const GoogleDocsHeader: React.FC<GoogleDocsHeaderProps> = ({
  currentDoc,
  onBackToDashboard,
  onRenameTitle,
  saveStatus,
  onOpenShareModal,
  onOpenAttachments,
  onOpenVersionHistory,
  onOpenAiCopilot,
  onNewDoc,
  onDeleteDoc
}) => {
  const { currentUser, users, switchUser, logout } = useAuth();
  const [docTitle, setDocTitle] = useState(currentDoc.title);
  const [isStarred, setIsStarred] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDocTitle(currentDoc.title);
  }, [currentDoc.title]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleBlur = () => {
    const trimmed = docTitle.trim();
    if (trimmed && trimmed !== currentDoc.title) {
      onRenameTitle(trimmed);
    } else {
      setDocTitle(currentDoc.title);
    }
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([currentDoc.content.replace(/<[^>]+>/g, '\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handleExportHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${currentDoc.title}</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;}</style></head><body><h1>${currentDoc.title}</h1>${currentDoc.content}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const handlePrint = () => {
    setActiveMenu(null);
    window.print();
  };

  const otherCollaborators = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="bg-[#00091f] border-b border-[#97c2f8]/20 px-4 pt-2.5 pb-1 flex flex-col gap-1 select-none no-print sticky top-0 z-40 text-[#f1f7ff]">
      {/* Top Row: Ajaia Docs Icon, Title, Actions, Share & Profile */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Ajaia Docs Glowing Logo + Title Box + Star/Cloud */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            title="Ajaia Workspace Home"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#001d6b] via-[#1a73e8] to-[#97c2f8] border border-[#97c2f8]/40 text-white flex items-center justify-center transition-all shrink-0 hover:scale-105 shadow-md shadow-blue-900/30"
          >
            <FileText className="w-5 h-5 text-white" />
          </button>

          {/* Title & Metadata */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {currentDoc.canEdit ? (
                <input
                  type="text"
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  onKeyDown={e => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  className="font-medium text-[16px] sm:text-[17px] text-[#f1f7ff] px-2 py-0.5 rounded hover:border hover:border-[#97c2f8]/40 focus:outline-none focus:border-[#97c2f8] focus:bg-[#001244] bg-transparent transition-all max-w-[260px] sm:max-w-md truncate"
                  title="Click to rename deliverable"
                />
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 font-medium text-[16px] sm:text-[17px] text-[#f1f7ff]">
                  <span className="truncate max-w-[260px] sm:max-w-md">{docTitle}</span>
                  <span title="View only access">
                    <Lock className="w-3.5 h-3.5 text-amber-400 ml-1" />
                  </span>
                </div>
              )}

              {/* Star Button */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="p-1 rounded-full hover:bg-[#001244] text-[#aebfe2] transition-colors"
                title={isStarred ? 'Starred' : 'Star document'}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'hover:text-[#97c2f8]'}`} />
              </button>

              {/* Cloud Sync Status */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#aebfe2] ml-2" title="Cloud status">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-[#97c2f8]">
                    <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                    <span>Saving to Ajaia...</span>
                  </span>
                ) : saveStatus === 'unsaved' ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Unsaved</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#97c2f8]/80 hover:text-[#97c2f8]">
                    <CloudUpload className="w-3.5 h-3.5 text-[#97c2f8]" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>

            {/* Google Docs-Style Menu Bar */}
            <div className="flex items-center gap-0.5 text-[13px] text-[#aebfe2] relative -ml-1" ref={menuBarRef}>
              {/* File Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`px-2 py-0.5 rounded hover:bg-[#001244] hover:text-[#f1f7ff] transition-colors ${activeMenu === 'file' ? 'bg-[#001244] text-[#97c2f8]' : ''}`}
                >
                  File
                </button>
                {activeMenu === 'file' && (
                  <div className="absolute left-0 mt-1 w-64 bg-[#001244] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                    <button
                      onClick={() => { onNewDoc(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center justify-between text-[#f1f7ff]"
                    >
                      <span className="flex items-center gap-2"><FilePlus className="w-4 h-4 text-[#97c2f8]" /> New Deliverable</span>
                      <span className="text-[#aebfe2] text-[10px]">Ctrl+N</span>
                    </button>
                    <button
                      onClick={onBackToDashboard}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <FolderInput className="w-4 h-4 text-[#97c2f8]" /> Open Workspace
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <Download className="w-4 h-4 text-[#97c2f8]" /> Download as Markdown (.md)
                    </button>
                    <button
                      onClick={handleExportHtml}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <Download className="w-4 h-4 text-[#97c2f8]" /> Download as Web Page (.html)
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center justify-between text-[#f1f7ff]"
                    >
                      <span className="flex items-center gap-2"><Printer className="w-4 h-4 text-[#97c2f8]" /> Print / PDF</span>
                      <span className="text-[#aebfe2] text-[10px]">Ctrl+P</span>
                    </button>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button
                      onClick={() => { onOpenVersionHistory(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <History className="w-4 h-4 text-[#97c2f8]" /> Version history
                    </button>
                    {currentDoc.isOwner && (
                      <>
                        <div className="h-[1px] bg-white/10 my-1" />
                        <button
                          onClick={() => { onDeleteDoc(); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-950/50 text-red-400 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Move to trash
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Edit Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                  className={`px-2 py-0.5 rounded hover:bg-[#001244] hover:text-[#f1f7ff] transition-colors ${activeMenu === 'edit' ? 'bg-[#001244] text-[#97c2f8]' : ''}`}
                >
                  Edit
                </button>
                {activeMenu === 'edit' && (
                  <div className="absolute left-0 mt-1 w-52 bg-[#001244] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                    <div className="px-4 py-1.5 text-[#97c2f8] text-[11px] uppercase tracking-wider font-semibold">Shortcuts</div>
                    <div className="px-4 py-1.5 text-[#f1f7ff] flex justify-between"><span>Undo</span><span className="text-[#aebfe2]">Ctrl+Z</span></div>
                    <div className="px-4 py-1.5 text-[#f1f7ff] flex justify-between"><span>Redo</span><span className="text-[#aebfe2]">Ctrl+Y</span></div>
                    <div className="px-4 py-1.5 text-[#f1f7ff] flex justify-between"><span>Save Now</span><span className="text-[#aebfe2]">Ctrl+S</span></div>
                    <div className="px-4 py-1.5 text-[#f1f7ff] flex justify-between"><span>Select All</span><span className="text-[#aebfe2]">Ctrl+A</span></div>
                  </div>
                )}
              </div>

              {/* View Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                  className={`px-2 py-0.5 rounded hover:bg-[#001244] hover:text-[#f1f7ff] transition-colors ${activeMenu === 'view' ? 'bg-[#001244] text-[#97c2f8]' : ''}`}
                >
                  View
                </button>
                {activeMenu === 'view' && (
                  <div className="absolute left-0 mt-1 w-56 bg-[#001244] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                    <div className="px-4 py-2 hover:bg-[#001d6b] flex items-center justify-between text-[#f1f7ff]">
                      <span>Mode: {currentDoc.canEdit ? 'Editing' : 'Viewing'}</span>
                      <Check className="w-3.5 h-3.5 text-[#97c2f8]" />
                    </div>
                    <div className="px-4 py-2 hover:bg-[#001d6b] flex items-center justify-between text-[#f1f7ff]">
                      <span>Show ruler</span>
                      <Check className="w-3.5 h-3.5 text-[#97c2f8]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Insert Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
                  className={`px-2 py-0.5 rounded hover:bg-[#001244] hover:text-[#f1f7ff] transition-colors ${activeMenu === 'insert' ? 'bg-[#001244] text-[#97c2f8]' : ''}`}
                >
                  Insert
                </button>
                {activeMenu === 'insert' && (
                  <div className="absolute left-0 mt-1 w-56 bg-[#001244] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                    <button
                      onClick={() => { onOpenAttachments(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <Paperclip className="w-4 h-4 text-[#97c2f8]" /> Attachment file
                    </button>
                  </div>
                )}
              </div>

              {/* Tools Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                  className={`px-2 py-0.5 rounded hover:bg-[#001244] hover:text-[#f1f7ff] transition-colors ${activeMenu === 'tools' ? 'bg-[#001244] text-[#97c2f8]' : ''}`}
                >
                  Tools
                </button>
                {activeMenu === 'tools' && (
                  <div className="absolute left-0 mt-1 w-56 bg-[#001244] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-50 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                    <button
                      onClick={() => { onOpenVersionHistory(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#001d6b] flex items-center gap-2 text-[#f1f7ff]"
                    >
                      <History className="w-4 h-4 text-[#97c2f8]" /> Version history
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Collaborators Presence, Share Button, Profile Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Live Collaborator Presence Avatars */}
          <div className="hidden md:flex items-center -space-x-1.5 mr-1" title="Active collaborators in this workspace">
            {otherCollaborators.slice(0, 3).map((collab) => (
              <div
                key={collab.id}
                className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#00091f] shadow-sm ring-2 ring-[#97c2f8]/60"
                style={{ backgroundColor: collab.avatar_color }}
                title={`${collab.name} (${collab.role_title}) - Active`}
              >
                {collab.name.slice(0, 1)}
              </div>
            ))}
          </div>

          {/* Attachments quick pill */}
          <button
            onClick={onOpenAttachments}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-[#aebfe2] hover:text-[#f1f7ff] hover:bg-[#001244] text-xs font-medium flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#97c2f8]/20"
            title="Document Attachments"
          >
            <Paperclip className="w-4 h-4 text-[#97c2f8]" />
            <span className="hidden lg:inline text-[12px]">Files</span>
            {currentDoc.attachments.length > 0 && (
              <span className="bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/40 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {currentDoc.attachments.length}
              </span>
            )}
          </button>

          {/* History quick pill */}
          <button
            onClick={onOpenVersionHistory}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-[#aebfe2] hover:text-[#f1f7ff] hover:bg-[#001244] text-xs font-medium flex items-center gap-1.5 transition-colors border border-transparent hover:border-[#97c2f8]/20"
            title="Version History"
          >
            <History className="w-4 h-4 text-[#97c2f8]" />
            <span className="hidden lg:inline text-[12px]">History</span>
          </button>

          {/* Ajaia AI Copilot Button */}
          <button
            onClick={onOpenAiCopilot}
            className="bg-gradient-to-r from-[#001d6b] via-[#1a73e8] to-[#97c2f8] hover:opacity-90 text-white font-semibold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-900/30 group border border-white/20"
            title="Open Ajaia AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f1f7ff] group-hover:rotate-12 transition-transform" />
            <span className="font-medium">Ajaia AI</span>
          </button>

          {/* Ajaia Signature Sky-Blue Share Button */}
          <button
            onClick={onOpenShareModal}
            className="bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] font-bold px-4 py-1.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/20"
            title="Share deliverable permissions"
          >
            <Lock className="w-3.5 h-3.5 text-[#00091f]" />
            <span>Share</span>
            {currentDoc.collaborators.length > 0 && (
              <span className="bg-[#00091f] text-[#97c2f8] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {currentDoc.collaborators.length + 1}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Switcher & Logout Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-inner hover:ring-2 hover:ring-[#97c2f8] border border-[#97c2f8]/40 transition-all ml-1"
              style={{ backgroundColor: currentUser?.avatar_color || '#001d6b' }}
              title={`Signed in as ${currentUser?.name}`}
            >
              {currentUser?.name.slice(0, 2).toUpperCase() || 'U'}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#001244] rounded-2xl shadow-2xl border border-[#97c2f8]/30 py-3 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="font-bold text-[#f1f7ff] text-sm">{currentUser?.name}</p>
                  <p className="text-[#aebfe2] text-[11px]">{currentUser?.email}</p>
                  <span className="inline-block mt-1 bg-[#001d6b] text-[#97c2f8] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#97c2f8]/30">
                    {currentUser?.role_title}
                  </span>
                </div>

                <div className="px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aebfe2] mb-1.5">
                    Switch Test Persona:
                  </p>
                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left p-1.5 rounded-xl flex items-center justify-between hover:bg-[#001d6b]/60 transition-colors ${
                          u.id === currentUser?.id ? 'bg-[#001d6b] font-semibold text-[#97c2f8] border border-[#97c2f8]/40' : 'text-[#f1f7ff]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white/20"
                            style={{ backgroundColor: u.avatar_color }}
                          >
                            {u.name.slice(0, 1)}
                          </div>
                          <span className="truncate max-w-[170px]">{u.name}</span>
                        </div>
                        {u.id === currentUser?.id && <Check className="w-3.5 h-3.5 text-[#97c2f8]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 px-2 pt-1 mt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/40 rounded-xl flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign out of workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
