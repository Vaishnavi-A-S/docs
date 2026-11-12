import React from 'react';
import { DocumentListItem } from '../../types';
import { FileText, Users, Paperclip, Clock, Trash2, Share2, MoreVertical, Shield } from 'lucide-react';

interface DocumentCardProps {
  doc: DocumentListItem;
  onOpen: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onShare: (doc: DocumentListItem) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  onOpen,
  onDelete,
  onShare
}) => {
  const getRoleBadge = () => {
    if (doc.isOwner) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
          <Shield className="w-3 h-3 text-blue-600" /> Owner
        </span>
      );
    }
    if (doc.userRole === 'editor') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full">
          Editor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
        Viewer
      </span>
    );
  };

  return (
    <div
      onClick={() => onOpen(doc.id)}
      className="group bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-150 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* Top Banner / Document Preview Area */}
      <div className="p-5 pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>{getRoleBadge()}</div>
        </div>

        <h3 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-1 mb-1" title={doc.title}>
          {doc.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 h-8 leading-relaxed">
          {doc.snippet || 'Blank document...'}
        </p>
      </div>

      {/* Card Metadata & Footer */}
      <div className="px-5 py-3 bg-white flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: doc.ownerAvatarColor }}
            title={`Owner: ${doc.ownerName}`}
          >
            {doc.ownerName.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-[11px] text-slate-600 truncate max-w-[100px]">
            {doc.isOwner ? 'You' : doc.ownerName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {doc.attachmentsCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500" title={`${doc.attachmentsCount} attachment(s)`}>
              <Paperclip className="w-3 h-3 text-slate-400" />
              {doc.attachmentsCount}
            </span>
          )}

          {doc.collaboratorsCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500" title={`${doc.collaboratorsCount} collaborator(s)`}>
              <Users className="w-3 h-3 text-slate-400" />
              {doc.collaboratorsCount}
            </span>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            {doc.isOwner && (
              <>
                <button
                  onClick={() => onShare(doc)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600 transition-colors"
                  title="Share document"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(doc.id, doc.title)}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
