import React, { useState } from 'react';
import { DocumentListItem } from '../../types';
import { DocumentCard } from './DocumentCard';
import { LayoutGrid, List, FileText, Plus, Shield, Users, ArrowUpDown } from 'lucide-react';

interface DocumentListProps {
  documents: DocumentListItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDoc: (id: string) => void;
  onDeleteDoc: (id: string, title: string) => void;
  onShareDoc: (doc: DocumentListItem) => void;
  onNewDoc: () => void;
  isLoading: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  activeTab,
  onTabChange,
  onOpenDoc,
  onDeleteDoc,
  onShareDoc,
  onNewDoc,
  isLoading
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const ownedCount = documents.filter(d => d.isOwner).length;
  const sharedCount = documents.filter(d => !d.isOwner).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Documents</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full">
              {documents.length}
            </span>
          </button>

          <button
            onClick={() => onTabChange('owned')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'owned'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Owned by Me</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full">
              {ownedCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('shared')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'shared'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-600" />
            <span>Shared with Me</span>
            <span className="text-[11px] px-1.5 py-0.2 bg-slate-200/70 text-slate-700 rounded-full">
              {sharedCount}
            </span>
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              viewMode === 'grid'
                ? 'bg-white border-slate-300 text-blue-600 shadow-sm'
                : 'border-transparent text-slate-400 hover:bg-slate-100'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white border-slate-300 text-blue-600 shadow-sm'
                : 'border-transparent text-slate-400 hover:bg-slate-100'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400 animate-pulse">
          Loading workspace documents...
        </div>
      ) : documents.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'shared'
              ? 'No documents have been shared with you under this user account yet. Switch users or create and share a document!'
              : 'Get started by creating a new document or importing a markdown file.'}
          </p>
          <button
            onClick={onNewDoc}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Document</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {documents.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onOpen={onOpenDoc}
              onDelete={onDeleteDoc}
              onShare={onShareDoc}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Your Role</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate max-w-xs">{doc.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: doc.ownerAvatarColor }}
                      >
                        {doc.ownerName.slice(0, 1).toUpperCase()}
                      </div>
                      <span>{doc.isOwner ? 'You' : doc.ownerName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        doc.isOwner
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : doc.userRole === 'editor'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {doc.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                    {doc.isOwner && (
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onShareDoc(doc)}
                          className="text-slate-500 hover:text-blue-600 font-medium"
                        >
                          Share
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => onDeleteDoc(doc.id, doc.title)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
