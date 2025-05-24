'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FiArrowLeft, FiSave, FiCheck, FiEdit2, FiFileText, FiList, FiSettings, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useAuthStore, useDocumentsStore } from '@/lib/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Editor from '@/components/Editor'
import AIAssistant from '@/components/AIAssistant'
import PlagiarismChecker from '@/components/PlagiarismChecker'
import DocumentStructure from '@/components/DocumentStructure'

type SidebarSection = 'structure' | 'ai' | 'plagiarism' | 'settings';

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { currentDocument, setCurrentDocument } = useDocumentsStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeSection, setActiveSection] = useState<SidebarSection>('structure')
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [selectedText, setSelectedText] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchDocument()
  }, [isAuthenticated, params.id])

  useEffect(() => {
    const interval = setInterval(() => {
      if (content && currentDocument && content !== currentDocument.content) {
        saveDocument()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [content, currentDocument])

  useEffect(() => {
    // Calculate word and character count
    const text = content.replace(/<[^>]*>/g, '') // Remove HTML tags
    setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
    setCharCount(text.length)
  }, [content])

  // Handle text selection in editor
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString())
      }
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('keyup', handleSelection)

    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('keyup', handleSelection)
    }
  }, [])

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${params.id}`)
      setCurrentDocument(response.data)
      setContent(response.data.content)
    } catch (error) {
      toast.error('Failed to fetch document')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const saveDocument = async () => {
    if (!currentDocument || saving) return
    
    setSaving(true)
    try {
      await api.put(`/documents/${params.id}`, {
        content
      })
      setLastSaved(new Date())
      toast.success('Документ сохранен', { duration: 2000 })
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const getProgress = () => {
    // Simplified progress calculation based on word count
    const targetWords = 5000; // Target word count for a typical academic paper
    return Math.min((wordCount / targetWords) * 100, 100);
  }

  if (loading || !currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка документа...</div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'structure' as const, icon: FiList, label: 'Структура документа' },
    { id: 'ai' as const, icon: FiFileText, label: 'AI Ассистент' },
    { id: 'plagiarism' as const, icon: FiCheckCircle, label: 'Проверка оригинальности' },
    { id: 'settings' as const, icon: FiSettings, label: 'Настройки' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft />
            <span>Назад</span>
          </button>
          <h1 className="text-xl font-semibold text-white">{currentDocument.title}</h1>
          <p className="text-sm text-muted mt-1">{currentDocument.type}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`sidebar-item w-full ${activeSection === item.id ? 'active' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Progress */}
        <div className="p-6 border-t border-border">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Прогресс</span>
              <span className="text-white">{getProgress().toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Слов:</span>
              <span className="text-white">{wordCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Символов:</span>
              <span className="text-white">{charCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-white">Редактор</h2>
            {lastSaved && (
              <span className="text-sm text-muted flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                Сохранено {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveDocument}
              disabled={saving}
              className={`btn-primary flex items-center gap-2 ${saving ? 'opacity-50' : ''}`}
            >
              {saving ? <FiCheck className="w-4 h-4" /> : <FiSave className="w-4 h-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Editor */}
          <div className="flex-1 bg-background">
            <Editor content={content} onChange={setContent} />
          </div>

          {/* Right Panel */}
          <div className="w-96 bg-card border-l border-border overflow-hidden">
            {activeSection === 'structure' && (
              <DocumentStructure content={content} />
            )}

            {activeSection === 'ai' && (
              <div className="h-full">
                <AIAssistant 
                  content={content} 
                  selectedText={selectedText}
                  onUpdateContent={setContent} 
                />
              </div>
            )}

            {activeSection === 'plagiarism' && (
              <div className="h-full">
                <PlagiarismChecker documentId={params.id as string} />
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-white">Настройки документа</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted">Название</label>
                    <input
                      type="text"
                      value={currentDocument.title}
                      className="input w-full"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted">Тип документа</label>
                    <select className="input w-full" disabled>
                      <option>{currentDocument.type}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted">Целевой объем</label>
                    <input
                      type="number"
                      placeholder="5000"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted">Дедлайн</label>
                    <input
                      type="date"
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}