import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Undo2,
  Redo2,
  Printer,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Save,
  Check,
  ChevronDown,
  Eye,
  Edit3,
  RemoveFormatting,
  Sparkles,
  Lock
} from 'lucide-react';

interface GoogleDocsToolbarProps {
  editor: Editor | null;
  canEdit: boolean;
  isSaving: boolean;
  onSaveManual: () => void;
  userRole: string;
}

export const GoogleDocsToolbar: React.FC<GoogleDocsToolbarProps> = ({
  editor,
  canEdit,
  isSaving,
  onSaveManual,
  userRole
}) => {
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState('100%');
  const [fontFamily, setFontFamily] = useState('Inter');

  if (!editor) return null;

  if (!canEdit) {
    return (
      <div className="bg-[#fff8e1] border-b border-[#ffe082] px-6 py-2 flex items-center justify-between text-[#795548] text-xs no-print">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-medium">
            <strong>Viewing only:</strong> You can only view this document. To make edits or upload attachments, ask the document owner for edit access.
          </span>
        </div>
        <span className="bg-[#ffe082] text-[#5d4037] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
          Viewer Mode
        </span>
      </div>
    );
  }

  const currentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal text';
  };

  const handleStyleSelect = (type: string) => {
    setStyleDropdownOpen(false);
    if (type === 'normal') {
      editor.chain().focus().setParagraph().run();
    } else if (type === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (type === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (type === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const ToolbarIconBtn = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded hover:bg-[#e1e5eb] transition-colors ${
        isActive ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746]'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-[#edf2fa] px-3 py-1.5 border-b border-[#dadce0] flex items-center justify-between no-print select-none sticky top-[53px] z-30">
      <div className="flex items-center gap-1 flex-wrap bg-[#f8fafd] px-2.5 py-1 rounded-full border border-[#d3e3fd]/60 shadow-xs">
        {/* Undo / Redo */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarIconBtn>

        {/* Print */}
        <ToolbarIconBtn
          onClick={() => window.print()}
          title="Print (Ctrl+P)"
        >
          <Printer className="w-4 h-4" />
        </ToolbarIconBtn>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Zoom Dropdown */}
        <div className="relative">
          <button
            onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-[#444746] hover:bg-[#e1e5eb] rounded font-medium"
            title="Zoom"
          >
            <span>{zoomLevel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          {zoomDropdownOpen && (
            <div className="absolute left-0 mt-1 w-24 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 text-xs">
              {['75%', '90%', '100%', '125%', '150%'].map(z => (
                <button
                  key={z}
                  onClick={() => {
                    setZoomLevel(z);
                    setZoomDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#edf2fa] flex items-center justify-between ${
                    zoomLevel === z ? 'font-bold text-[#1a73e8]' : 'text-slate-700'
                  }`}
                >
                  <span>{z}</span>
                  {zoomLevel === z && <Check className="w-3 h-3 text-[#1a73e8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Styles Dropdown (Normal text, Heading 1, 2, 3) */}
        <div className="relative">
          <button
            onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#444746] hover:bg-[#e1e5eb] rounded font-medium min-w-[100px] justify-between"
            title="Styles"
          >
            <span>{currentHeading()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {styleDropdownOpen && (
            <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <button
                onClick={() => handleStyleSelect('normal')}
                className="w-full text-left px-3.5 py-2 hover:bg-[#edf2fa] text-slate-800"
              >
                Normal text
              </button>
              <button
                onClick={() => handleStyleSelect('h1')}
                className="w-full text-left px-3.5 py-2 hover:bg-[#edf2fa] text-slate-900 font-bold text-sm"
              >
                Heading 1
              </button>
              <button
                onClick={() => handleStyleSelect('h2')}
                className="w-full text-left px-3.5 py-2 hover:bg-[#edf2fa] text-slate-900 font-semibold text-xs"
              >
                Heading 2
              </button>
              <button
                onClick={() => handleStyleSelect('h3')}
                className="w-full text-left px-3.5 py-2 hover:bg-[#edf2fa] text-slate-900 font-medium text-xs"
              >
                Heading 3
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Font formatting: Bold, Italic, Underline, Strikethrough */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarIconBtn>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Alignment */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarIconBtn>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Lists & Quotes & Code */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bulleted list"
        >
          <List className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </ToolbarIconBtn>
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Code className="w-4 h-4" />
        </ToolbarIconBtn>

        <div className="h-4 w-[1px] bg-[#c7c7c7] mx-1" />

        {/* Clear formatting */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarIconBtn>
      </div>

      {/* Right: Quick Save Action Button */}
      <div className="flex items-center gap-2 pl-2">
        <button
          onClick={onSaveManual}
          disabled={isSaving}
          className="bg-white hover:bg-[#edf2fa] text-[#1a73e8] border border-[#d3e3fd] font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
          title="Save to cloud (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
