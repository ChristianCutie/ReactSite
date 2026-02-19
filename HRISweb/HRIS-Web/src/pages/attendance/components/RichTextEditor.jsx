import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React from 'react';
import './RichTextEditor.css'; // we'll create this next

const RichTextEditor = ({ value, onChange, placeholder, readOnly = false }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
  });

  // Toolbar component
  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="btn-toolbar mb-2" role="toolbar" aria-label="Formatting tools">
        <button
          type="button"
          className={`btn btn-sm ${editor.isActive('bold') ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className={`btn btn-sm ${editor.isActive('italic') ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          className={`btn btn-sm ${editor.isActive('underline') ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </button>
        <button
          type="button"
          className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet List
        </button>
        <button
          type="button"
          className={`btn btn-sm ${editor.isActive('orderedList') ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered List
        </button>
      </div>
    );
  };

  return (
    <div className="rich-text-editor">
      <MenuBar />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;