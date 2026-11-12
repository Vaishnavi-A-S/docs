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
  ExternalLink
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
    <div className="min-h-screen bg-white text-[#202124] flex flex-col font-sans select-none">
      {/* 1. Google Docs Authentic Top Bar */}
      <header className="px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#dadce0] gap-4 sticky top-0 bg-white z-40">
        {/* Left: Hamburger + Google Docs Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('all')}>
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
              <path d="M14 2V8H20L14 2Z" fill="#A1C2FA"/>
              <path d="M16 13H8V11.5H16V13ZM16 16.5H8V15H16V16.5ZM12 10H8V8.5H12V10Z" fill="white"/>
            </svg>
            <span className="font-semibold text-xl text-[#444746] tracking-tight">Docs</span>
          </div>
        </div>

        {/* Center: Google-style Large Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search documents and content..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-[#edf2fa] hover:bg-[#e4ebf5] focus:bg-white text-sm text-[#1f1f1f] pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:border-slate-300 focus:shadow-md focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Right: Workspace SSO & Profile Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{currentUser?.role_title}</p>
          </div>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-inner hover:ring-2 hover:ring-[#1a73e8] transition-all"
              style={{ backgroundColor: currentUser?.avatar_color || '#1a73e8' }}
              title={`Signed in as ${currentUser?.name}`}
            >
              {currentUser?.name.slice(0, 2).toUpperCase()}
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{currentUser?.name}</p>
                  <p className="text-slate-500 text-[11px]">{currentUser?.email}</p>
                  <span className="inline-block mt-1 bg-blue-50 text-[#1a73e8] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {currentUser?.role_title}
                  </span>
                </div>

                <div className="px-4 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Switch Persona:
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
      </header>

      {/* 2. Template Gallery Header ("Start a new document") */}
      <section className="bg-[#f1f3f4] border-b border-[#e0e0e0] py-6 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#444746]">Start a new document</h2>
            <button
              onClick={onImportClick}
              className="text-xs font-semibold text-[#1a73e8] hover:bg-[#e1e5eb] px-3 py-1 rounded-full transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" /> Import File (.md, .txt)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Blank Document (+ with authentic Google Docs styling) */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc()}>
              <div className="h-36 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-md shadow-2xs hover:shadow-md transition-all flex items-center justify-center">
                <svg className="w-10 h-10 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                  <path fill="#4285F4" d="M24 10v28M10 24h28" stroke="#4285F4" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-xs font-semibold text-[#1f1f1f] group-hover:text-[#1a73e8]">Blank document</p>
            </div>

            {/* Template: Product Strategy */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('strategy')}>
              <div className="h-36 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-md shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between overflow-hidden">
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-[#1a73e8] rounded-xs" />
                  <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
                  <div className="h-1.5 w-5/6 bg-slate-200 rounded-xs" />
                  <div className="h-1.5 w-4/6 bg-slate-100 rounded-xs" />
                </div>
                <div className="text-[10px] text-blue-600 font-semibold bg-blue-50 p-1 rounded">
                  Strategy Template
                </div>
              </div>
              <p className="text-xs font-medium text-[#1f1f1f] truncate group-hover:text-[#1a73e8]">Product Proposal</p>
            </div>

            {/* Template: Meeting Notes */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('notes')}>
              <div className="h-36 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-md shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between overflow-hidden">
                <div className="space-y-1.5">
                  <div className="h-2 w-2/3 bg-purple-600 rounded-xs" />
                  <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
                  <div className="h-1.5 w-3/4 bg-slate-200 rounded-xs" />
                  <div className="flex gap-1 pt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-200" />
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-xs" />
                  </div>
                </div>
                <div className="text-[10px] text-purple-600 font-semibold bg-purple-50 p-1 rounded">
                  Meeting Notes
                </div>
              </div>
              <p className="text-xs font-medium text-[#1f1f1f] truncate group-hover:text-[#1a73e8]">Sprint Notes</p>
            </div>

            {/* Template: Engineering RFC */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={() => onNewDoc('rfc')}>
              <div className="h-36 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-md shadow-2xs hover:shadow-md transition-all p-3 flex flex-col justify-between overflow-hidden">
                <div className="space-y-1.5">
                  <div className="h-2 w-3/4 bg-amber-600 rounded-xs" />
                  <div className="h-10 bg-slate-900 rounded p-1.5 text-[8px] text-emerald-400 font-mono">
                    interface Schema...
                  </div>
                </div>
                <div className="text-[10px] text-amber-600 font-semibold bg-amber-50 p-1 rounded">
                  Technical RFC
                </div>
              </div>
              <p className="text-xs font-medium text-[#1f1f1f] truncate group-hover:text-[#1a73e8]">Engineering Spec</p>
            </div>

            {/* Quick Import Action */}
            <div className="flex flex-col gap-2 group cursor-pointer" onClick={onImportClick}>
              <div className="h-36 bg-white border border-dashed border-[#1a73e8]/50 hover:border-[#1a73e8] hover:bg-blue-50/20 rounded-md shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-center p-3 text-center">
                <UploadCloud className="w-7 h-7 text-[#1a73e8] mb-1" />
                <span className="text-[11px] font-semibold text-[#1a73e8]">Import File</span>
                <span className="text-[9px] text-slate-400">.md, .txt, .html</span>
              </div>
              <p className="text-xs font-medium text-[#1f1f1f] truncate group-hover:text-[#1a73e8]">Ingest Document</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Documents List (Google Docs Main Body) */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 space-y-5">
        {/* Filter and Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dadce0] pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === 'all'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-semibold'
                  : 'text-[#444746] hover:bg-slate-100'
              }`}
            >
              All Documents ({documents.length})
            </button>

            <button
              onClick={() => onTabChange('owned')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                activeTab === 'owned'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-semibold'
                  : 'text-[#444746] hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Owned by me ({ownedCount})</span>
            </button>

            <button
              onClick={() => onTabChange('shared')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1.5 ${
                activeTab === 'shared'
                  ? 'bg-[#c2e7ff] text-[#001d35] font-semibold'
                  : 'text-[#444746] hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Shared with me ({sharedCount})</span>
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${viewMode === 'grid' ? 'text-[#1a73e8]' : 'text-slate-500'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${viewMode === 'table' ? 'text-[#1a73e8]' : 'text-slate-500'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Documents Grid or Table */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No documents yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === 'shared'
                ? 'No documents have been shared with this account. Switch personas or create and share a document!'
                : 'Click "Blank document" above or import a markdown file to get started.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Exact Google Docs Grid Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map(doc => {
              const isMenuOpen = activeMenuDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="bg-white rounded-lg border border-[#dadce0] hover:border-[#1a73e8] shadow-2xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
                >
                  {/* Document miniature preview area */}
                  <div className="h-36 bg-[#f8f9fa] p-4 border-b border-[#dadce0] overflow-hidden relative">
                    <p className="text-[10px] text-slate-600 line-clamp-6 leading-relaxed select-none font-serif">
                      {doc.snippet || 'Untitled document draft...'}
                    </p>
                  </div>

                  {/* Bottom strip: Title, Date, 3-dots */}
                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Google Docs Icon */}
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
                        <path d="M14 2V8H20L14 2Z" fill="#A1C2FA"/>
                      </svg>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#1f1f1f] truncate group-hover:text-[#1a73e8]" title={doc.title}>
                          {doc.title}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {doc.isOwner ? 'Owned by me' : `Shared by ${doc.ownerName}`}
                        </p>
                      </div>
                    </div>

                    {/* 3-dots actions menu */}
                    <div className="relative shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuDocId(isMenuOpen ? null : doc.id)}
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        title="Document options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 bottom-8 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs">
                          <button
                            onClick={() => { onOpenDoc(doc.id); setActiveMenuDocId(null); }}
                            className="w-full text-left px-3.5 py-1.5 hover:bg-[#edf2fa] flex items-center gap-2"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" /> Open
                          </button>
                          {doc.isOwner && (
                            <button
                              onClick={() => { onShareDoc(doc); setActiveMenuDocId(null); }}
                              className="w-full text-left px-3.5 py-1.5 hover:bg-[#edf2fa] flex items-center gap-2"
                            >
                              <Share2 className="w-3.5 h-3.5 text-slate-400" /> Share
                            </button>
                          )}
                          {doc.isOwner && (
                            <button
                              onClick={() => { onDeleteDoc(doc.id, doc.title); setActiveMenuDocId(null); }}
                              className="w-full text-left px-3.5 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
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
          /* Google Docs Table View */
          <div className="bg-white rounded-lg border border-[#dadce0] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fa] border-b border-[#dadce0] text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Owner</th>
                  <th className="py-2.5 px-4">Your Role</th>
                  <th className="py-2.5 px-4">Last Modified</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <tr
                    key={doc.id}
                    onClick={() => onOpenDoc(doc.id)}
                    className="hover:bg-[#f1f3f4] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-4 font-semibold text-[#1f1f1f] flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
                        <path d="M14 2V8H20L14 2Z" fill="#A1C2FA"/>
                      </svg>
                      <span className="truncate max-w-sm">{doc.title}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {doc.isOwner ? 'me' : doc.ownerName}
                    </td>
                    <td className="py-2.5 px-4 capitalize font-medium text-slate-600">
                      {doc.userRole}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      {doc.isOwner && (
                        <button
                          onClick={() => onShareDoc(doc)}
                          className="text-[#1a73e8] hover:underline mr-3 font-semibold"
                        >
                          Share
                        </button>
                      )}
                      {doc.isOwner && (
                        <button
                          onClick={() => onDeleteDoc(doc.id, doc.title)}
                          className="text-slate-400 hover:text-red-600"
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
