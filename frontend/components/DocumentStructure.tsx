'use client'

import { useEffect, useState } from 'react'
import { FiFileText, FiChevronRight } from 'react-icons/fi'

interface DocumentStructureProps {
  content: string
}

interface Heading {
  id: string
  text: string
  level: number
  position: number
}

export default function DocumentStructure({ content }: DocumentStructureProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeHeading, setActiveHeading] = useState<string>('')

  useEffect(() => {
    // Parse headings from HTML content
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const foundHeadings: Heading[] = []
    
    // Find all heading elements
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1])
      const text = heading.textContent || ''
      
      if (text.trim()) {
        foundHeadings.push({
          id: `heading-${index}`,
          text: text.trim(),
          level,
          position: index
        })
      }
    })
    
    setHeadings(foundHeadings)
  }, [content])

  const scrollToHeading = (headingIndex: number) => {
    // Find the heading in the editor
    const editorElement = document.querySelector('.tiptap')
    if (!editorElement) return
    
    const headingElements = editorElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
    if (headingElements[headingIndex]) {
      headingElements[headingIndex].scrollIntoView({ behavior: 'smooth', block: 'center' })
      setActiveHeading(`heading-${headingIndex}`)
    }
  }

  const getIndentClass = (level: number) => {
    const indentSize = (level - 1) * 16
    return `pl-${Math.min(indentSize, 64)}`
  }

  // Default structure if no headings found
  const defaultStructure = [
    { text: 'Введение', level: 1 },
    { text: 'Теоретическая часть', level: 1 },
    { text: 'Обзор литературы', level: 2 },
    { text: 'Практическая часть', level: 1 },
    { text: 'Методология', level: 2 },
    { text: 'Результаты', level: 2 },
    { text: 'Заключение', level: 1 },
    { text: 'Список литературы', level: 1 },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-primary" />
          Структура документа
        </h3>
        <p className="text-sm text-muted mt-1">
          {headings.length > 0 ? 'Навигация по разделам' : 'Рекомендуемая структура'}
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {headings.length > 0 ? (
          <div className="space-y-2">
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.position)}
                className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 hover:bg-secondary/50 ${
                  activeHeading === heading.id ? 'bg-primary/20 text-white' : 'text-muted hover:text-white'
                }`}
                style={{ paddingLeft: `${(heading.level - 1) * 16 + 12}px` }}
              >
                <div className="flex items-center gap-2">
                  <FiChevronRight className="w-3 h-3 opacity-50" />
                  <span className={`text-sm ${heading.level === 1 ? 'font-medium' : ''}`}>
                    {heading.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted mb-4">
              Документ пока не содержит заголовков. Рекомендуемая структура:
            </p>
            {defaultStructure.map((item, index) => (
              <div
                key={index}
                className="px-3 py-2 text-muted"
                style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
              >
                <div className="flex items-center gap-2">
                  <FiChevronRight className="w-3 h-3 opacity-50" />
                  <span className={`text-sm ${item.level === 1 ? 'font-medium' : ''}`}>
                    {item.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {headings.length > 0 && (
        <div className="p-6 border-t border-border">
          <div className="text-sm text-muted">
            <div className="flex justify-between mb-1">
              <span>Разделов:</span>
              <span className="text-white">{headings.filter(h => h.level === 1).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Подразделов:</span>
              <span className="text-white">{headings.filter(h => h.level > 1).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}