import React, { useState, useRef } from 'react';
import { Attachment } from '../../types';
import { uploadAttachment, deleteAttachment, getAttachmentDownloadUrl } from '../../services/api';
import { X, Paperclip, Download, Trash2, File, Upload, AlertCircle } from 'lucide-react';

interface AttachmentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  canEdit: boolean;
  attachments: Attachment[];
  onAttachmentsUpdated: (attachments: Attachment[]) => void;
}

export const AttachmentsDrawer: React.FC<AttachmentsDrawerProps> = ({
  isOpen,
  onClose,
  docId,
  canEdit,
  attachments,
  onAttachmentsUpdated
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      setError('');
      const updated = await uploadAttachment(docId, file);
      onAttachmentsUpdated(updated);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attId: string, name: string) => {
    if (!window.confirm(`Delete attachment "${name}"?`)) return;
    try {
      const updated = await deleteAttachment(docId, attId);
      onAttachmentsUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete attachment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-800">
              Document Attachments ({attachments.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {canEdit ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{isUploading ? 'Uploading Attachment...' : 'Upload New Attachment (PDF, CSV, Images...)'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              Only document owners and editors can upload attachments.
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            {attachments.map(att => (
              <div
                key={att.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 bg-white border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                    <File className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={att.original_name}>
                      {att.original_name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {(att.size_bytes / 1024).toFixed(1)} KB • by {att.uploader_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={getAttachmentDownloadUrl(docId, att.id)}
                    download={att.original_name}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {canEdit && (
                    <button
                      onClick={() => handleDelete(att.id, att.original_name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      title="Delete attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {attachments.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No attachments uploaded yet for this document.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
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
