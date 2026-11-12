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
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#00060f]/80 backdrop-blur-md flex justify-end animate-in fade-in duration-150 select-none text-[#f1f7ff]">
      <div className="w-full max-w-md bg-[#001244] h-full shadow-2xl border-l border-[#97c2f8]/30 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#00091f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 rounded-xl">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f1f7ff]">Deliverable Attachments</h2>
              <p className="text-[11px] text-[#aebfe2]">
                {attachments.length} {attachments.length === 1 ? 'file' : 'files'} attached
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area for Editors */}
          {canEdit ? (
            <div className="p-4 bg-[#00091f] rounded-2xl border border-dashed border-[#97c2f8]/40 hover:border-[#97c2f8] transition-colors text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex flex-col items-center gap-2 py-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#97c2f8] group-hover:underline">
                    {isUploading ? 'Uploading attachment...' : 'Upload new attachment'}
                  </span>
                  <p className="text-[10px] text-[#aebfe2] mt-0.5">
                    Images, PDFs, spreadsheets, or source artifacts (max 25MB)
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-[#00091f] rounded-xl border border-[#97c2f8]/20 text-xs text-[#aebfe2]">
              You have view-only access. Only editors can upload or delete attachments.
            </div>
          )}

          {/* List of Attachments */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#97c2f8] uppercase tracking-wider mb-2">
              Attached Files
            </h3>

            {attachments.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#aebfe2] space-y-2 bg-[#00091f]/60 rounded-2xl border border-[#97c2f8]/20 p-6">
                <Paperclip className="w-8 h-8 text-[#97c2f8]/40 mx-auto" />
                <p>No attachments yet</p>
              </div>
            ) : (
              attachments.map(att => (
                <div
                  key={att.id}
                  className="p-3 rounded-xl bg-[#00091f] border border-[#97c2f8]/20 hover:border-[#97c2f8]/60 transition-colors flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 flex items-center justify-center shrink-0">
                      <File className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#f1f7ff] truncate" title={att.original_name || att.filename}>
                        {att.original_name || att.filename}
                      </p>
                      <p className="text-[10px] text-[#aebfe2]">
                        {(att.size_bytes / 1024).toFixed(1)} KB • {new Date(att.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={getAttachmentDownloadUrl(docId, att.id)}
                      download={att.original_name || att.filename}
                      className="p-1.5 text-[#97c2f8] hover:text-white hover:bg-[#001d6b] rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(att.id, att.original_name || att.filename)}
                        className="p-1.5 text-[#aebfe2] hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
