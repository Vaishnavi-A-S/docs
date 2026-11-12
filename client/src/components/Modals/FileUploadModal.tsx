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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Import Document File</h2>
              <p className="text-xs text-slate-500">Convert local files into editable documents</p>
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
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.markdown,.html,.htm,.json"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  validateAndSetFile(e.target.files[0]);
                }
              }}
            />

            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 break-all">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <span className="text-xs text-blue-600 mt-3 hover:underline">Click or drag another to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Drag and drop your file here, or <span className="text-blue-600 font-semibold">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Supported formats: <strong>.md</strong>, <strong>.txt</strong>, <strong>.html</strong>, <strong>.json</strong>
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">What happens on import:</p>
            <p>• Markdown headings, lists, bold, and code formatting are converted automatically.</p>
            <p>• Document title is extracted directly from the filename.</p>
            <p>• Saved immediately with your user account as owner.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {isUploading ? (
              <span>Importing & Processing...</span>
            ) : (
              <span>Import as New Document</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
