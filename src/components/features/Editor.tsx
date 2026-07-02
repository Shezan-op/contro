"use client";

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';

interface EditorProps {
  content: JSONContent; // JSON AST
  onChange: (content: JSONContent) => void;
  isEditable?: boolean;
}

export function Editor({ content, onChange, isEditable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
    ],
    content,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert focus:outline-none max-w-none w-full min-h-[500px] text-lg bg-transparent text-[var(--text)] leading-relaxed',
      },
    },
  });

  // Effect to update content if it changes externally (e.g., initial load)
  useEffect(() => {
    if (editor && content && editor.isEmpty && Object.keys(content).length > 0) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <EditorContent editor={editor} />
      <div className="flex justify-end text-xs text-[var(--muted)] mt-4">
        {editor.storage.characterCount.words()} words
      </div>
    </div>
  );
}
