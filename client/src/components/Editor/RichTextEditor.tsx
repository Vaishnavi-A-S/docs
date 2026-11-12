import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
import { WordCounter } from './WordCounter';

interface RichTextEditorProps {
  initialContent: string;
  canEdit: boolean;
  userRole: string;
  onSaveContent: (content: string) => Promise<void>;
  onSaveStatusChange: (status: 'saved' | 'saving' | 'unsaved') => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  canEdit,
  userRole,
  onSaveContent,
  onSaveStatusChange
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<any>(null);
  const lastSavedContentRef = useRef(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Placeholder.configure({
        placeholder: 'Type something wonderful, or paste notes here...'
      })
    ],
    content: initialContent,
    editable: canEdit,
    onUpdate: ({ editor }) => {
      if (!canEdit) return;

      const html = editor.getHTML();
      if (html !== lastSavedContentRef.current) {
        onSaveStatusChange('unsaved');

        // Clear previous timer
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set debounced autosave (1.5 seconds)
        debounceTimerRef.current = setTimeout(async () => {
          await triggerSave(html);
        }, 1500);
      }
    }
  });

  // Keep editable state synced if user switches
  useEffect(() => {
    if (editor && editor.isEditable !== canEdit) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor]);

  // Keep content synced if restored from version or parent updates
  useEffect(() => {
    if (editor && initialContent !== lastSavedContentRef.current) {
      editor.commands.setContent(initialContent);
      lastSavedContentRef.current = initialContent;
    }
  }, [initialContent, editor]);

  const triggerSave = useCallback(
    async (contentToSave?: string) => {
      if (!editor || !canEdit) return;

      const html = contentToSave || editor.getHTML();
      try {
        setIsSaving(true);
        onSaveStatusChange('saving');
        await onSaveContent(html);
        lastSavedContentRef.current = html;
        onSaveStatusChange('saved');
      } catch (err) {
        console.error('Failed to save document:', err);
        onSaveStatusChange('unsaved');
      } finally {
        setIsSaving(false);
      }
    },
    [editor, canEdit, onSaveContent, onSaveStatusChange]
  );

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (canEdit) {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          triggerSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, triggerSave]);

  const currentHtml = editor ? editor.getHTML() : initialContent;

  return (
    <div className="flex flex-col flex-1 bg-[#f0f3f6] min-h-screen">
      <EditorToolbar
        editor={editor}
        canEdit={canEdit}
        isSaving={isSaving}
        onSaveManual={() => triggerSave()}
        userRole={userRole}
      />

      {/* Google Docs Canvas Workspace */}
      <div className="flex-1 overflow-y-auto px-4 py-8 flex justify-center">
        <div
          className="w-full max-w-[850px] bg-white rounded-sm shadow-md border border-slate-200/80 min-h-[950px] p-12 sm:p-16 mb-20 print-page transition-shadow"
          style={{ minHeight: '1050px' }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <WordCounter content={currentHtml} />
    </div>
  );
};
