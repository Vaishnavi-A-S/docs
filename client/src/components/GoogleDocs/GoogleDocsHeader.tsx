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
  CheckSquare
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

  // Other active simulated team members who have access or are in company
  const otherCollaborators = users.filter(u => u.id !== currentUser?.id);

  return (
    <div className="bg-white border-b border-[#dadce0] px-4 pt-2.5 pb-1 flex flex-col gap-1 select-none no-print sticky top-0 z-40">
      {/* Top Row: Docs Icon, Title, Actions, Share & Profile */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Google Docs Logo + Title Box + Star/Cloud */}
        <div className="flex items-center gap-3">
          {/* Authentic Google Docs Blue Icon */}
          <button
            onClick={onBackToDashboard}
            title="Docs Home"
            className="w-10 h-10 rounded hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 group"
          >
            <div className="relative">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
                <path d="M14 2V8H20L14 2Z" fill="#A1C2FA"/>
                <path d="M16 13H8V11.5H16V13ZM16 16.5H8V15H16V16.5ZM12 10H8V8.5H12V10Z" fill="white"/>
              </svg>
            </div>
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
                  className="font-medium text-[17px] text-[#1f1f1f] px-2 py-0.5 rounded hover:border hover:border-slate-300 focus:outline-none focus:border-[#1a73e8] focus:bg-white bg-transparent transition-all max-w-[280px] sm:max-w-md truncate"
                  title="Rename"
                />
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 font-medium text-[17px] text-[#1f1f1f]">
                  <span className="truncate max-w-[280px] sm:max-w-md">{docTitle}</span>
                  <span title="View only">
                    <Lock className="w-3.5 h-3.5 text-amber-600 ml-1" />
                  </span>
                </div>
              )}

              {/* Star Button */}
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                title={isStarred ? 'Starred' : 'Star document'}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : 'hover:text-slate-600'}`} />
              </button>

              {/* Cloud Sync Status */}
              <div className="hidden sm:flex items-center gap-1 text-[12px] text-slate-500 ml-2" title="Cloud status">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1 text-blue-600">
                    <CloudUpload className="w-3.5 h-3.5 animate-bounce" />
                    <span>Saving...</span>
                  </span>
                ) : saveStatus === 'unsaved' ? (
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Unsaved</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
                    <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.09 9.08l1.41 1.42L10 17z"/>
                    </svg>
                  </span>
                )}
              </div>
            </div>

            {/* Google Docs Authentic Menu Bar */}
            <div className="flex items-center gap-0.5 text-[13px] text-[#444746] relative -ml-1" ref={menuBarRef}>
              {/* File Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                  className={`px-2 py-0.5 rounded hover:bg-[#edf2fa] transition-colors ${activeMenu === 'file' ? 'bg-[#edf2fa] text-[#1a73e8]' : ''}`}
                >
                  File
                </button>
                {activeMenu === 'file' && (
                  <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => { onNewDoc(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><FilePlus className="w-4 h-4 text-slate-500" /> New Document</span>
                      <span className="text-slate-400 text-[10px]">Ctrl+N</span>
                    </button>
                    <button
                      onClick={onBackToDashboard}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2"
                    >
                      <FolderInput className="w-4 h-4 text-slate-500" /> Open Dashboard
                    </button>
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-slate-500" /> Download as Markdown (.md)
                    </button>
                    <button
                      onClick={handleExportHtml}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-slate-500" /> Download as Web Page (.html)
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2"><Printer className="w-4 h-4 text-slate-500" /> Print / PDF</span>
                      <span className="text-slate-400 text-[10px]">Ctrl+P</span>
                    </button>
                    <div className="h-[1px] bg-slate-100 my-1" />
                    <button
                      onClick={() => { onOpenVersionHistory(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2"
                    >
                      <History className="w-4 h-4 text-slate-500" /> Version history
                    </button>
                    {currentDoc.isOwner && (
                      <>
                        <div className="h-[1px] bg-slate-100 my-1" />
                        <button
                          onClick={() => { onDeleteDoc(); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
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
                  className={`px-2 py-0.5 rounded hover:bg-[#edf2fa] transition-colors ${activeMenu === 'edit' ? 'bg-[#edf2fa] text-[#1a73e8]' : ''}`}
                >
                  Edit
                </button>
                {activeMenu === 'edit' && (
                  <div className="absolute left-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-4 py-1.5 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Shortcuts</div>
                    <div className="px-4 py-1.5 text-slate-700 flex justify-between"><span>Undo</span><span className="text-slate-400">Ctrl+Z</span></div>
                    <div className="px-4 py-1.5 text-slate-700 flex justify-between"><span>Redo</span><span className="text-slate-400">Ctrl+Y</span></div>
                    <div className="px-4 py-1.5 text-slate-700 flex justify-between"><span>Save Now</span><span className="text-slate-400">Ctrl+S</span></div>
                    <div className="px-4 py-1.5 text-slate-700 flex justify-between"><span>Select All</span><span className="text-slate-400">Ctrl+A</span></div>
                  </div>
                )}
              </div>

              {/* View Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                  className={`px-2 py-0.5 rounded hover:bg-[#edf2fa] transition-colors ${activeMenu === 'view' ? 'bg-[#edf2fa] text-[#1a73e8]' : ''}`}
                >
                  View
                </button>
                {activeMenu === 'view' && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 hover:bg-[#edf2fa] flex items-center justify-between text-slate-700">
                      <span>Mode: {currentDoc.canEdit ? 'Editing' : 'Viewing'}</span>
                      <Check className="w-3.5 h-3.5 text-[#1a73e8]" />
                    </div>
                    <div className="px-4 py-2 hover:bg-[#edf2fa] flex items-center justify-between text-slate-700">
                      <span>Show ruler</span>
                      <Check className="w-3.5 h-3.5 text-[#1a73e8]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Insert Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'insert' ? null : 'insert')}
                  className={`px-2 py-0.5 rounded hover:bg-[#edf2fa] transition-colors ${activeMenu === 'insert' ? 'bg-[#edf2fa] text-[#1a73e8]' : ''}`}
                >
                  Insert
                </button>
                {activeMenu === 'insert' && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => { onOpenAttachments(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2 text-slate-700"
                    >
                      <Paperclip className="w-4 h-4 text-slate-500" /> Attachment file
                    </button>
                  </div>
                )}
              </div>

              {/* Tools Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
                  className={`px-2 py-0.5 rounded hover:bg-[#edf2fa] transition-colors ${activeMenu === 'tools' ? 'bg-[#edf2fa] text-[#1a73e8]' : ''}`}
                >
                  Tools
                </button>
                {activeMenu === 'tools' && (
                  <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <button
                      onClick={() => { onOpenVersionHistory(); setActiveMenu(null); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#edf2fa] flex items-center gap-2 text-slate-700"
                    >
                      <History className="w-4 h-4 text-slate-500" /> Version history
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Collaborators Presence, Share Button, Profile Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Live Collaborator Presence Avatars (Google Docs Signature) */}
          <div className="hidden md:flex items-center -space-x-1.5 mr-1" title="Active collaborators in this workspace">
            {otherCollaborators.slice(0, 3).map((collab, i) => (
              <div
                key={collab.id}
                className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-emerald-500/80"
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
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Document Attachments"
          >
            <Paperclip className="w-4 h-4 text-slate-500" />
            <span className="hidden lg:inline text-[12px]">Files</span>
            {currentDoc.attachments.length > 0 && (
              <span className="bg-[#1a73e8] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {currentDoc.attachments.length}
              </span>
            )}
          </button>

          {/* History quick pill */}
          <button
            onClick={onOpenVersionHistory}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-slate-600 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Version History"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden lg:inline text-[12px]">History</span>
          </button>

          {/* Ajaia AI Copilot Button */}
          <button
            onClick={onOpenAiCopilot}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all shadow-sm group"
            title="Open Ajaia AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Ajaia AI</span>
          </button>

          {/* Google Docs Signature Blue Share Button */}
          <button
            onClick={onOpenShareModal}
            className="bg-[#c2e7ff] hover:bg-[#b3dcf8] text-[#001d35] font-semibold px-4 py-1.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-xs"
            title="Share document"
          >
            <Lock className="w-3.5 h-3.5 text-[#001d35]" />
            <span>Share</span>
            {currentDoc.collaborators.length > 0 && (
              <span className="bg-[#001d35] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {currentDoc.collaborators.length + 1}
              </span>
            )}
          </button>

          {/* User Profile Avatar with Switcher & Logout Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-inner hover:ring-2 hover:ring-[#1a73e8] transition-all ml-1"
              style={{ backgroundColor: currentUser?.avatar_color || '#1a73e8' }}
              title={`Signed in as ${currentUser?.name}`}
            >
              {currentUser?.name.slice(0, 2).toUpperCase() || 'U'}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2.5 z-50 text-xs">
                {/* Current User Header */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{currentUser?.name}</p>
                  <p className="text-slate-500 text-[11px]">{currentUser?.email}</p>
                  <span className="inline-block mt-1 bg-blue-50 text-[#1a73e8] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {currentUser?.role_title}
                  </span>
                </div>

                {/* Switch to Other Seeded Members */}
                <div className="px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Switch Test Account:
                  </p>
                  <div className="space-y-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between hover:bg-slate-50 ${
                          u.id === currentUser?.id ? 'bg-blue-50/70 font-semibold text-[#1a73e8]' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                            style={{ backgroundColor: u.avatar_color }}
                          >
                            {u.name.slice(0, 1)}
                          </div>
                          <span className="truncate max-w-[170px]">{u.name}</span>
                        </div>
                        {u.id === currentUser?.id && <Check className="w-3.5 h-3.5 text-[#1a73e8]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-slate-100 px-2 pt-1 mt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
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
