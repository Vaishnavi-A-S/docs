import React, { useState, useRef } from 'react';
import { importFileAsDocument } from '../../services/api';
import { DocumentDetail } from '../../types';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (doc: DocumentDetail) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allowedExtensions = ['.md', '.txt', '.markdown', '.html', '.htm', '.json'];

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Unsupported file type '${ext}'. Please upload Markdown (.md), Plain text (.txt), HTML (.html), or JSON.`);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File is too large (maximum size is 10MB).');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');
      const newDoc = await importFileAsDocument(file);
      onDocumentCreated(newDoc);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00060f]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none text-[#f1f7ff]">
      <div className="bg-[#001244] rounded-3xl shadow-2xl border border-[#97c2f8]/30 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#f1f7ff]">Import Deliverable File</h2>
              <p className="text-[11px] text-[#aebfe2]">Converts Markdown, Text, or HTML into an editable doc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#aebfe2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#97c2f8] bg-[#001d6b]/50'
                : file
                ? 'border-emerald-400 bg-emerald-950/30'
                : 'border-[#97c2f8]/30 bg-[#00091f]/80 hover:border-[#97c2f8] hover:bg-[#001d6b]/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
              accept=".md,.txt,.markdown,.html,.htm,.json"
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-emerald-900/50 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-400/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#f1f7ff] truncate max-w-[260px] mx-auto">{file.name}</p>
                  <p className="text-[10px] text-[#aebfe2]">{(file.size / 1024).toFixed(1)} KB • Ready to convert</p>
                </div>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-[11px] text-red-400 hover:underline pt-1"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-[#001d6b] text-[#97c2f8] border border-[#97c2f8]/30 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#f1f7ff]">
                    Click to select or drag and drop
                  </p>
                  <p className="text-[11px] text-[#aebfe2] mt-0.5">
                    Markdown (.md), Text (.txt), or HTML (.html)
                  </p>
                </div>
                <p className="text-[10px] text-[#97c2f8]/80 font-mono">Maximum file size: 10MB</p>
              </div>
            )}
          </div>

          {/* Format Information pill */}
          <div className="p-3 bg-[#00091f] rounded-xl border border-[#97c2f8]/20 text-[11px] text-[#aebfe2] space-y-1">
            <p className="font-bold text-[#97c2f8]">Supported Ingestion Engine:</p>
            <p>• Markdown headings, bold, italics, quotes, lists, and tables are preserved.</p>
            <p>• Creates an active deliverable you own and can immediately share with team members.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#00091f] border-t border-[#97c2f8]/20 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#aebfe2] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="bg-[#97c2f8] hover:bg-[#c4dcfb] text-[#00091f] font-bold px-5 py-2 rounded-full text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            {isUploading ? 'Converting...' : 'Import & Open'}
          </button>
        </div>
      </div>
    </div>
  );
};
