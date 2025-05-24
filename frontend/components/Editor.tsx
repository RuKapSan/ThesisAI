'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { FiBold, FiItalic, FiCode, FiList, FiLink, FiImage, FiTable } from 'react-icons/fi'

const lowlight = createLowlight(common)

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-full',
      },
    },
  })

  if (!editor) {
    return null
  }

  const addLink = () => {
    const url = window.prompt('Введите URL:')
    if (url) {
      ;(editor.commands as any).setLink({ href: url })
    }
  }

  const addImage = () => {
    const url = window.prompt('Введите URL изображения:')
    if (url) {
      ;(editor.commands as any).setImage({ src: url })
    }
  }

  const addTable = () => {
    ;(editor.commands as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true })
  }

  const toolbarButtons = [
    {
      icon: FiBold,
      action: () => (editor as any).commands.toggleBold(),
      isActive: editor.isActive('bold'),
      tooltip: 'Жирный'
    },
    {
      icon: FiItalic,
      action: () => (editor as any).commands.toggleItalic(),
      isActive: editor.isActive('italic'),
      tooltip: 'Курсив'
    },
    {
      icon: FiCode,
      action: () => (editor as any).commands.toggleCode(),
      isActive: editor.isActive('code'),
      tooltip: 'Код'
    },
    {
      icon: FiList,
      action: () => (editor as any).commands.toggleBulletList(),
      isActive: editor.isActive('bulletList'),
      tooltip: 'Список'
    },
    {
      icon: FiLink,
      action: addLink,
      isActive: editor.isActive('link'),
      tooltip: 'Ссылка'
    },
    {
      icon: FiImage,
      action: addImage,
      isActive: false,
      tooltip: 'Изображение'
    },
    {
      icon: FiTable,
      action: addTable,
      isActive: false,
      tooltip: 'Таблица'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-border p-3 flex items-center gap-2 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            onClick={button.action}
            className={`p-2 rounded-md transition-all duration-200 ${
              button.isActive ? 'bg-primary text-white' : 'hover:bg-secondary text-muted hover:text-white'
            }`}
            title={button.tooltip}
          >
            <button.icon className="w-4 h-4" />
          </button>
        ))}
        
        <div className="h-6 w-px bg-border mx-2" />
        
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value)
            if (level === 0) {
              ;(editor as any).commands.setParagraph()
            } else {
              ;(editor as any).commands.toggleHeading({ level: level as any })
            }
          }}
          className="bg-secondary text-white px-3 py-1.5 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="0">Обычный текст</option>
          <option value="1">Заголовок 1</option>
          <option value="2">Заголовок 2</option>
          <option value="3">Заголовок 3</option>
        </select>
      </div>
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} className="min-h-full" />
        </div>
      </div>
    </div>
  )
}