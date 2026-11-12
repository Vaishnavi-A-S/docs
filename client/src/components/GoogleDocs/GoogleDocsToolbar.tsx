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

  if (!editor) return null;

  if (!canEdit) {
    return (
      <div className="bg-amber-950/50 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-amber-200 text-xs no-print backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-medium">
            <strong className="text-amber-100">Viewing only:</strong> You have read-only access to this deliverable. To propose changes, request edit permissions from the owner.
          </span>
        </div>
        <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-amber-400/30">
          Viewer Role
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
      className={`p-1.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#001d6b] text-[#97c2f8] font-bold border border-[#97c2f8]/40 shadow-xs'
          : 'text-[#aebfe2] hover:text-[#f1f7ff] hover:bg-[#001d6b]/60'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-[#001244] px-3 py-1.5 border-b border-[#97c2f8]/20 flex items-center justify-between no-print select-none sticky top-[53px] z-30 backdrop-blur-md">
      <div className="flex items-center gap-1 flex-wrap bg-[#000e2e]/90 px-2.5 py-1 rounded-full border border-[#97c2f8]/20 shadow-inner">
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

        <div className="h-4 w-[1px] bg-[#97c2f8]/20 mx-1" />

        {/* Zoom Selector */}
        <div className="relative">
          <button
            onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#aebfe2] hover:text-[#f1f7ff] hover:bg-[#001d6b]/60 transition-colors"
            title="Zoom"
          >
            <span>{zoomLevel}</span>
            <ChevronDown className="w-3 h-3 text-[#97c2f8]" />
          </button>
          {zoomDropdownOpen && (
            <div className="absolute left-0 mt-1 w-24 bg-[#000e2e] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1 z-40 text-xs text-[#f1f7ff]">
              {['75%', '90%', '100%', '125%', '150%'].map(z => (
                <button
                  key={z}
                  onClick={() => { setZoomLevel(z); setZoomDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-[#001d6b] flex items-center justify-between ${
                    zoomLevel === z ? 'font-bold text-[#97c2f8]' : ''
                  }`}
                >
                  <span>{z}</span>
                  {zoomLevel === z && <Check className="w-3 h-3 text-[#97c2f8]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#97c2f8]/20 mx-1" />

        {/* Paragraph & Headings Styles Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[#f1f7ff] hover:bg-[#001d6b]/60 transition-colors min-w-[105px] justify-between"
            title="Styles"
          >
            <span>{currentHeading()}</span>
            <ChevronDown className="w-3 h-3 text-[#97c2f8]" />
          </button>

          {styleDropdownOpen && (
            <div className="absolute left-0 mt-1 w-44 bg-[#000e2e] rounded-xl shadow-2xl border border-[#97c2f8]/30 py-1.5 z-40 text-xs text-[#f1f7ff]">
              <button
                onClick={() => handleStyleSelect('normal')}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#001d6b] flex items-center justify-between ${
                  !editor.isActive('heading') ? 'font-bold text-[#97c2f8]' : ''
                }`}
              >
                <span>Normal text</span>
                {!editor.isActive('heading') && <Check className="w-3 h-3 text-[#97c2f8]" />}
              </button>
              <button
                onClick={() => handleStyleSelect('h1')}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#001d6b] flex items-center justify-between text-base font-bold ${
                  editor.isActive('heading', { level: 1 }) ? 'text-[#97c2f8]' : ''
                }`}
              >
                <span>Heading 1</span>
                {editor.isActive('heading', { level: 1 }) && <Check className="w-3 h-3 text-[#97c2f8]" />}
              </button>
              <button
                onClick={() => handleStyleSelect('h2')}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#001d6b] flex items-center justify-between text-sm font-semibold ${
                  editor.isActive('heading', { level: 2 }) ? 'text-[#97c2f8]' : ''
                }`}
              >
                <span>Heading 2</span>
                {editor.isActive('heading', { level: 2 }) && <Check className="w-3 h-3 text-[#97c2f8]" />}
              </button>
              <button
                onClick={() => handleStyleSelect('h3')}
                className={`w-full text-left px-3 py-1.5 hover:bg-[#001d6b] flex items-center justify-between text-xs font-semibold ${
                  editor.isActive('heading', { level: 3 }) ? 'text-[#97c2f8]' : ''
                }`}
              >
                <span>Heading 3</span>
                {editor.isActive('heading', { level: 3 }) && <Check className="w-3 h-3 text-[#97c2f8]" />}
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#97c2f8]/20 mx-1" />

        {/* Text Formatting: Bold, Italic, Underline, Strikethrough */}
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

        <div className="h-4 w-[1px] bg-[#97c2f8]/20 mx-1" />

        {/* Alignments */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left (Ctrl+Shift+L)"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarIconBtn>

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center (Ctrl+Shift+E)"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarIconBtn>

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right (Ctrl+Shift+R)"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarIconBtn>

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Justify (Ctrl+Shift+J)"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarIconBtn>

        <div className="h-4 w-[1px] bg-[#97c2f8]/20 mx-1" />

        {/* Lists & Quotes */}
        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bulleted list (Ctrl+Shift+8)"
        >
          <List className="w-4 h-4" />
        </ToolbarIconBtn>

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list (Ctrl+Shift+7)"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarIconBtn>

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote (Ctrl+Shift+9)"
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

        <ToolbarIconBtn
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </ToolbarIconBtn>
      </div>

      {/* Right: Manual Save Trigger with Autosave Indicator */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onSaveManual}
          disabled={isSaving}
          className="bg-[#001d6b] hover:bg-[#001d6b]/80 border border-[#97c2f8]/30 text-[#97c2f8] hover:text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          title="Save changes (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5 text-[#97c2f8]" />
          <span>{isSaving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
