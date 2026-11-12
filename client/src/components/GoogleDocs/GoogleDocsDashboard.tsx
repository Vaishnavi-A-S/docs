import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DocumentListItem } from '../../types';
import {
  FileText,
  Search,
  Plus,
  UploadCloud,
  Sparkles,
  FileCode2,
  MoreVertical,
  Share2,
  Trash2,
  Download,
  LayoutGrid,
  List,
  Menu,
  Shield,
  Users,
  LogOut,
  Folder,
  ArrowUpDown,
  Check,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface GoogleDocsDashboardProps {
  documents: DocumentListItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDoc: (id: string) => void;
  onDeleteDoc: (id: string, title: string) => void;
  onShareDoc: (doc: DocumentListItem) => void;
  onNewDoc: (template?: string) => void;
  onImportClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
}

export const GoogleDocsDashboard: React.FC<GoogleDocsDashboardProps> = ({
  documents,
  activeTab,
  onTabChange,
  onOpenDoc,
  onDeleteDoc,
  onShareDoc,
  onNewDoc,
  onImportClick,
  searchQuery,
  onSearchChange,
  isLoading
}) => {
  const { currentUser, users, switchUser, logout } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      setActiveMenuDocId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ownedCount = documents.filter(d => d.isOwner).length;
  const sharedCount = documents.filter(d => !d.isOwner).length;

  return (
    <div className="min-h-screen bg-[#00091f] text-[#f1f7ff] flex flex-col font-sans select-none selection:bg-[#97c2f8] selection:text-[#001d6b] relative">
      {/* Ambient Cosmic Background Glow matching ajaia.ai */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% -10%, rgba(0, 29, 107, 0.45) 0%, rgba(0, 9, 31, 0.95) 65%, #00060f 100%)'
        }}
      />
      <div className="fixed top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Ajaia Docs Authentic Top Navigation Bar */}
      <header className="px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#97c2f8]/15 gap-4 sticky top-0 bg-[#00091f]/95 backdrop-blur-md z-40 relative">
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onTabChange('all')}
            title="Ajaia Docs Home"
          >
            {/* Ajaia Docs Signature Glow Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#001d6b] via-[#1a73e8] to-[#97c2f8] border border-[#97c2f8]/40 text-white flex items-center justify-center shadow-lg shadow-blue-900/30 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-[#f1f7ff]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-lg text-white tracking-tight font-display">AJAIA</span>
                <span className="text-[11px] font-semibold text-[#97c2f8] tracking-widest uppercase bg-[#001d6b]/70 px-1.5 py-0.5 rounded border border-[#97c2f8]/30">DOCS</span>
              </div>
              <p className="text-[10px] text-[#aebfe2] tracking-wide hidden sm:block mt-0.5">
                AI Strategy & Engineering Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Center: Ajaia Cosmic Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-[#97c2f8]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search enterprise deliverables, SOPs, and strategy notes..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-[#001244]/80 hover:bg-[#001244] focus:bg-[#001244] text-xs sm:text-sm text-[#f1f7ff] pl-10 pr-4 py-2.5 rounded-full border border-[#97c2f8]/20 focus:border-[#97c2f8] focus:ring-2 focus:ring-[#97c2f8]/20 focus:outline-none transition-all placeholder:text-[#aebfe2]/60 shadow-inner"
            />
          </div>
        </div>

        {/* Right: Security Badge, User Persona & Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#97c2f8] font-medium bg-[#001244]/80 px-2.5 py-1 rounded-full border border-[#97c2f8]/20">
            <ShieldCheck className="w-3.5 h-3.5 text-[#97c2f8]" />
            <span>SOC 2 & HIPAA Governed</span>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <p className="text-xs font-bold text-[#f1f7ff] leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-[#aebfe2] leading-tight">{currentUser?.role_title}</p>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg border border-[#97c2f8]/40 hover:ring-2 hover:ring-[#97c2f8] transition-all"
              style={{ backgroundColor: currentUser?.avatar_color || '#001d6b' }}
              title={`Signed in as ${currentUser?.name}`}
            >
              {currentUser?.name.slice(0, 2).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-[#001244] rounded-2xl shadow-2xl border border-[#97c2f8]/30 py-3 z-50 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="font-bold text-[#f1f7ff] text-sm">{currentUser?.name}</p>
                  <p className="text-[#aebfe2] text-[11px]">{currentUser?.email}</p>
                  <span className="inline-block mt-1.5 bg-[#001d6b] text-[#97c2f8] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#97c2f8]/30">
                    {currentUser?.role_title}
                  </span>
                </div>

                <div className="px-4 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aebfe2] mb-2">
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
                        className={`w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-[#001d6b]/60 transition-colors ${
                          u.id === currentUser?.id ? 'bg-[#001d6b] font-semibold text-[#97c2f8] border border-[#97c2f8]/40' : 'text-[#f1f7ff]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white/20"
                            style={{ backgroundColor: u.avatar_color }}
                          >
                            {u.name.slice(0, 1)}
                          </div>
                          <div className="truncate max-w-[160px]">
                            <p className="truncate text-xs">{u.name}</p>
                            <p className="text-[10px] text-[#aebfe2] truncate">{u.role_title}</p>
                          </div>
                        </div>
                        {u.id === currentUser?.id && <Check className="w-3.5 h-3.5 text-[#97c2f8]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 px-2 pt-1.5 mt-1">
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
      </header>

      {/* 2. Template Gallery Header ("Start a new Ajaia deliverable") */}
      <section className="bg-[#001244]/80 border-b border-[#97c2f8]/15 py-6 px-4 sm:px-8 relative z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#97c2f8]" />
              <h2 className="text-xs sm:text-sm font-semibold text-[#f1f7ff] uppercase tracking-wider">
                Start a New Enterprise Deliverable
              </h2>
            </div>
            <button
              onClick={onImportClick}
              className="text-xs font-semibold text-[#97c2f8] hover:text-white bg-[#001d6b] hover:bg-[#001d6b]/80 border border-[#97c2f8]/30 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#97c2f8]" /> Import File (.md, .txt)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Blank Document */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc()}>
              <div className="h-36 bg-[#00091f]/90 border border-[#97c2f8]/30 hover:border-[#97c2f8] rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-all flex items-center justify-center group-hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-full bg-[#001d6b] border border-[#97c2f8]/40 flex items-center justify-center text-[#97c2f8] group-hover:bg-[#1a73e8] group-hover:text-white transition-all">
                  <Plus className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-semibold text-[#f1f7ff] group-hover:text-[#97c2f8] transition-colors">
                Blank document
              </p>
            </div>

            {/* Template: AI Strategy Roadmap */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('strategy')}>
              <div className="h-36 bg-[#00091f]/90 border border-[#97c2f8]/30 hover:border-[#97c2f8] rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-all p-3 flex flex-col justify-between overflow-hidden group-hover:scale-[1.02]">
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-[#97c2f8] rounded-xs" />
                  <div className="h-1.5 w-full bg-[#001d6b] rounded-xs" />
                  <div className="h-1.5 w-5/6 bg-[#001d6b] rounded-xs" />
                  <div className="h-1.5 w-4/6 bg-[#001244] rounded-xs" />
                </div>
                <div className="text-[10px] text-[#97c2f8] font-semibold bg-[#001d6b]/80 p-1.5 rounded-lg border border-[#97c2f8]/30 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#97c2f8] shrink-0" />
                  <span className="truncate">AI Strategy Roadmap</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#f1f7ff] truncate group-hover:text-[#97c2f8] transition-colors">
                AI Strategy Roadmap
              </p>
            </div>

            {/* Template: Agentic SOP */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('notes')}>
              <div className="h-36 bg-[#00091f]/90 border border-[#97c2f8]/30 hover:border-[#97c2f8] rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-all p-3 flex flex-col justify-between overflow-hidden group-hover:scale-[1.02]">
                <div className="space-y-1.5">
                  <div className="h-2 w-2/3 bg-purple-400 rounded-xs" />
                  <div className="h-1.5 w-full bg-[#001d6b] rounded-xs" />
                  <div className="h-1.5 w-3/4 bg-[#001d6b] rounded-xs" />
                  <div className="flex gap-1 pt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <div className="h-1.5 flex-1 bg-[#001244] rounded-xs" />
                  </div>
                </div>
                <div className="text-[10px] text-purple-300 font-semibold bg-purple-950/60 p-1.5 rounded-lg border border-purple-500/30 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-purple-300 shrink-0" />
                  <span className="truncate">Autonomous Agent SOP</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#f1f7ff] truncate group-hover:text-[#97c2f8] transition-colors">
                Agent Workflow Spec
              </p>
            </div>

            {/* Template: Technical RFC */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('rfc')}>
              <div className="h-36 bg-[#00091f]/90 border border-[#97c2f8]/30 hover:border-[#97c2f8] rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-all p-3 flex flex-col justify-between overflow-hidden group-hover:scale-[1.02]">
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-amber-400 rounded-xs" />
                  <div className="h-10 bg-[#00060f] rounded p-1.5 text-[8px] text-emerald-400 font-mono border border-white/5">
                    interface MultiModelGateway...
                  </div>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 p-1.5 rounded-lg border border-amber-500/30 flex items-center gap-1">
                  <FileCode2 className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="truncate">Multi-Model Gateway RFC</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#f1f7ff] truncate group-hover:text-[#97c2f8] transition-colors">
                Technical RFC
              </p>
            </div>

            {/* Quick Import Action */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={onImportClick}>
              <div className="h-36 bg-[#00091f]/60 border border-dashed border-[#97c2f8]/40 hover:border-[#97c2f8] hover:bg-[#001d6b]/30 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-all flex flex-col items-center justify-center p-3 text-center group-hover:scale-[1.02]">
                <UploadCloud className="w-7 h-7 text-[#97c2f8] mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-semibold text-[#97c2f8]">Import Document</span>
                <span className="text-[9px] text-[#aebfe2]">.md, .txt, .html</span>
              </div>
              <p className="text-xs font-medium text-[#f1f7ff] truncate group-hover:text-[#97c2f8] transition-colors">
                Ingest File
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Documents List (Ajaia Docs Main Body) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-5 relative z-10">
        {/* Filter and Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#97c2f8]/15 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === 'all'
                  ? 'bg-[#001d6b] text-[#97c2f8] font-bold border border-[#97c2f8]/40 shadow-sm'
                  : 'text-[#aebfe2] hover:text-white hover:bg-[#001244]'
              }`}
            >
              All Deliverables ({documents.length})
            </button>

            <button
              onClick={() => onTabChange('owned')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'owned'
                  ? 'bg-[#001d6b] text-[#97c2f8] font-bold border border-[#97c2f8]/40 shadow-sm'
                  : 'text-[#aebfe2] hover:text-white hover:bg-[#001244]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#97c2f8]" />
              <span>Authored by me ({ownedCount})</span>
            </button>

            <button
              onClick={() => onTabChange('shared')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'shared'
                  ? 'bg-[#001d6b] text-[#97c2f8] font-bold border border-[#97c2f8]/40 shadow-sm'
                  : 'text-[#aebfe2] hover:text-white hover:bg-[#001244]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Shared with me ({sharedCount})</span>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 self-end sm:self-auto bg-[#001244] p-1 rounded-full border border-[#97c2f8]/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-[#001d6b] text-[#97c2f8]' : 'text-[#aebfe2] hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition-colors ${viewMode === 'table' ? 'bg-[#001d6b] text-[#97c2f8]' : 'text-[#aebfe2] hover:text-white'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Documents Grid or Table */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-[#aebfe2]">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#001244]/40 rounded-3xl border border-[#97c2f8]/20 p-8">
            <FileText className="w-12 h-12 text-[#97c2f8]/50 mx-auto" />
            <p className="text-sm font-semibold text-[#f1f7ff]">No deliverables found</p>
            <p className="text-xs text-[#aebfe2] max-w-sm mx-auto">
              {activeTab === 'shared'
                ? 'No documents have been shared with this persona. Switch accounts using the profile menu or share a deliverable!'
                : 'Click "Blank document" above or import a markdown file to get started.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Ajaia Cosmic Grid Cards with High-Contrast Paper Preview */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map(doc => {
              const isMenuOpen = activeMenuDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="bg-[#001244] rounded-2xl border border-[#97c2f8]/20 hover:border-[#97c2f8] shadow-lg hover:shadow-blue-900/40 transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
                >
                  {/* Document miniature paper preview area */}
                  <div className="h-36 bg-[#f1f7ff] p-3.5 border-b border-[#97c2f8]/20 overflow-hidden relative group-hover:brightness-105 transition-all">
                    <div className="h-full bg-white rounded shadow-inner p-2.5 overflow-hidden">
                      <p className="text-[10px] text-slate-700 line-clamp-5 leading-relaxed select-none font-serif">
                        {doc.snippet || 'Untitled document draft...'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom strip: Title, Date, 3-dots */}
                  <div className="p-3.5 bg-[#001244] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-7 h-7 rounded-lg bg-[#001d6b] border border-[#97c2f8]/40 text-[#97c2f8] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#f1f7ff] truncate group-hover:text-[#97c2f8] transition-colors" title={doc.title}>
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-[#aebfe2]">
                          {doc.isOwner ? 'Authored by me' : `Shared by ${doc.ownerName}`}
                        </p>
                      </div>
                    </div>

                    {/* 3-dots actions menu */}
                    <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuDocId(isMenuOpen ? null : doc.id)}
                        className="p-1.5 rounded-lg hover:bg-[#001d6b] text-[#aebfe2] hover:text-white transition-colors"
                        title="Document options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 bottom-8 w-44 bg-[#000e2e] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-30 text-xs backdrop-blur-xl animate-in fade-in duration-100">
                          <button
                            onClick={() => { onOpenDoc(doc.id); setActiveMenuDocId(null); }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-[#001d6b] text-[#f1f7ff] flex items-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#97c2f8]" /> Open
                          </button>
                          {doc.isOwner && (
                            <button
                              onClick={() => { onShareDoc(doc); setActiveMenuDocId(null); }}
                              className="w-full text-left px-3.5 py-1.5 hover:bg-[#001d6b] text-[#f1f7ff] flex items-center gap-2"
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#97c2f8]" /> Share
                            </button>
                          )}
                          {doc.isOwner && (
                            <button
                              onClick={() => { onDeleteDoc(doc.id, doc.title); setActiveMenuDocId(null); }}
                              className="w-full text-left px-3.5 py-1.5 hover:bg-red-950/50 text-red-400 flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Ajaia Cosmic Table View */
          <div className="bg-[#001244] rounded-2xl border border-[#97c2f8]/20 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#000e2e] border-b border-[#97c2f8]/20 text-[#97c2f8] font-semibold">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Your Role</th>
                  <th className="py-3 px-4">Last Modified</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map(doc => (
                  <tr
                    key={doc.id}
                    onClick={() => onOpenDoc(doc.id)}
                    className="hover:bg-[#001d6b]/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#f1f7ff] flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#97c2f8] shrink-0" />
                      <span className="truncate max-w-sm">{doc.title}</span>
                    </td>
                    <td className="py-3 px-4 text-[#aebfe2]">
                      {doc.isOwner ? 'me' : doc.ownerName}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-[#97c2f8]">
                      {doc.userRole}
                    </td>
                    <td className="py-3 px-4 text-[#aebfe2]/80">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      {doc.isOwner && (
                        <button
                          onClick={() => onShareDoc(doc)}
                          className="text-[#97c2f8] hover:underline mr-3 font-semibold"
                        >
                          Share
                        </button>
                      )}
                      {doc.isOwner && (
                        <button
                          onClick={() => onDeleteDoc(doc.id, doc.title)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};
