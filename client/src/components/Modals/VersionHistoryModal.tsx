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
    if (!window.confirm(`Restore document to version "${version.version_label}"? Current edits will be preserved in a snapshot.`)) {
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Version History</h2>
              <p className="text-xs text-slate-500">Track and restore previous document states</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading versions...</div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No previous versions found.</div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-4 py-2">
              {versions.map((ver, idx) => (
                <div key={ver.id} className="relative group">
                  {/* Timeline point */}
                  <div
                    className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: ver.saved_by_avatar || '#6366f1' }}
                  />

                  <div className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <span>{ver.version_label}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-medium">
                            Latest
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(ver.created_at).toLocaleString()}</span>
                        <span>•</span>
                        <span>by {ver.saved_by_name}</span>
                      </p>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => handleRestore(ver)}
                        disabled={restoringId === ver.id}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
                        title="Restore this revision"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{restoringId === ver.id ? 'Restoring...' : 'Restore'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
