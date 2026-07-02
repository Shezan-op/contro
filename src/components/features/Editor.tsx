"use client";

import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCallback, useRef } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/core';

interface EditorProps {
  content: JSONContent; // JSON AST
  onChange: (content: JSONContent) => void;
  isEditable?: boolean;
}

export function Editor({ content, onChange, isEditable = true }: EditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleUpdate = useCallback(({ editor }: { editor: TiptapEditor }) => {
    onChangeRef.current(editor.getJSON());
  }, []);

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
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none max-w-none w-full min-h-[500px] text-lg bg-transparent text-[var(--text)] leading-relaxed',
      },
    },
  });

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
