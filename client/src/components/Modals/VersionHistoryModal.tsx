import React, { useState, useEffect } from 'react';
import { VersionSnapshot } from '../../types';
import { getDocumentVersions, restoreDocumentVersion } from '../../services/api';
import { X, History, RotateCcw, Clock, Calendar, Check, AlertCircle } from 'lucide-react';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  canEdit: boolean;
  onVersionRestored: (newTitle: string, newContent: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  docId,
  canEdit,
  onVersionRestored
}) => {
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, docId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getDocumentVersions(docId);
      setVersions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load versions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version: VersionSnapshot) => {
    if (!window.confirm(`Restore deliverable to version "${version.version_label}"? Current edits will be preserved in a snapshot.`)) {
      return;
    }

    try {
      setRestoringId(version.id);
      const res = await restoreDocumentVersion(docId, version.id);
      onVersionRestored(res.title, res.content);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to restore version');
    } finally {
      setRestoringId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#00060f]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 select-none text-[#f1f7ff]">
      <div className="w-full max-w-xl bg-[#001244] rounded-3xl shadow-2xl border border-[#97c2f8]/30 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#00091f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f1f7ff]">Version History & Audits</h2>
              <p className="text-[11px] text-[#aebfe2]">Immutable snapshots captured on every major revision</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#aebfe2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#aebfe2]">
              Loading audit snapshots...
            </div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#aebfe2] space-y-2 bg-[#00091f]/60 rounded-2xl border border-[#97c2f8]/20 p-6">
              <Clock className="w-8 h-8 text-[#97c2f8]/40 mx-auto" />
              <p>No historical revisions recorded yet</p>
              <p className="text-[10px]">Versions are generated automatically as edits accumulate over time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((ver, idx) => (
                <div
                  key={ver.id}
                  className="p-4 rounded-2xl bg-[#00091f] border border-[#97c2f8]/20 hover:border-[#97c2f8]/60 transition-colors flex items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#f1f7ff]">{ver.version_label}</span>
                      {idx === 0 && (
                        <span className="text-[9px] font-bold bg-[#001d6b] text-[#97c2f8] px-2 py-0.5 rounded-full border border-[#97c2f8]/30">
                          Latest Snapshot
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#aebfe2]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#97c2f8]" />
                        {new Date(ver.created_at).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>By {ver.saved_by_name}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleRestore(ver)}
                      disabled={restoringId === ver.id}
                      className="px-3.5 py-1.5 bg-[#001d6b] hover:bg-[#001d6b]/80 border border-[#97c2f8]/30 text-[#97c2f8] hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{restoringId === ver.id ? 'Restoring...' : 'Restore'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#00091f] border-t border-[#97c2f8]/20 flex items-center justify-between text-xs text-[#aebfe2]">
          <span>Full rollback protection enabled</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] font-bold rounded-full transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
