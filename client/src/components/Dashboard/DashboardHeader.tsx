import React from 'react';
import { Plus, UploadCloud, Sparkles, BookOpen, FileCode2, Search } from 'lucide-react';

interface DashboardHeaderProps {
  onNewDoc: (template?: string) => void;
  onImportClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onNewDoc,
  onImportClick,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="bg-white border-b border-slate-200 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Ajaia Collaborative Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create, edit, share, and manage documents with real-time permissions
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents or content..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Start a new document templates */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Start a new document
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Blank Document */}
            <button
              onClick={() => onNewDoc()}
              className="group p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">Blank Document</p>
                <p className="text-[10px] text-slate-400">Start from scratch</p>
              </div>
            </button>

            {/* Import File */}
            <button
              onClick={onImportClick}
              className="group p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 rounded-xl text-left transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700">Import File</p>
                <p className="text-[10px] text-slate-400">.md, .txt, .html, .json</p>
              </div>
            </button>

            {/* Strategy Spec */}
            <button
              onClick={() => onNewDoc('strategy')}
              className="group p-4 bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-400 rounded-xl text-left transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-700">Product Spec</p>
                <p className="text-[10px] text-slate-400">PRD template</p>
              </div>
            </button>

            {/* Engineering RFC */}
            <button
              onClick={() => onNewDoc('rfc')}
              className="group p-4 bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 rounded-xl text-left transition-all flex flex-col justify-between h-28"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-700">Engineering RFC</p>
                <p className="text-[10px] text-slate-400">Architecture template</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
