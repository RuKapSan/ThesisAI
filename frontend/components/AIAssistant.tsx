'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiCheck, FiRefreshCw, FiBookOpen, FiEdit3, FiZap, FiSend, FiX } from 'react-icons/fi'

interface AIAssistantProps {
  content: string
  selectedText?: string
  onUpdateContent: (content: string) => void
}

export default function AIAssistant({ content, selectedText = '', onUpdateContent }: AIAssistantProps) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [activeFunction, setActiveFunction] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [currentAction, setCurrentAction] = useState<any>(null)

  // Update prompt when selected text changes
  useEffect(() => {
    if (selectedText && showPromptInput) {
      setPrompt(prevPrompt => {
        if (!prevPrompt) return selectedText
        return prevPrompt
      })
    }
  }, [selectedText, showPromptInput])

  const executeAction = async (action?: any) => {
    const actionToExecute = action || currentAction
    
    if (!actionToExecute) {
      toast.error('Не выбрано действие')
      return
    }

    if (actionToExecute.type !== 'analyze' && !prompt.trim() && !selectedText && !content) {
      toast.error('Введите текст или выделите фрагмент')
      return
    }
    
    if (actionToExecute.type === 'analyze' && !content) {
      toast.error('Документ пуст')
      return
    }

    setLoading(true)
    setActiveFunction(actionToExecute.id)

    try {
      if (actionToExecute.type === 'check') {
        const response = await api.post('/ai/check', {
          text: prompt || selectedText || content,
          type: actionToExecute.checkType
        })
        setFeedback(response.data)
      } else if (actionToExecute.type === 'generate') {
        const response = await api.post('/ai/generate', {
          prompt: prompt || selectedText || 'Продолжить текст',
          context: content,
          type: actionToExecute.generateType
        })
        
        if (actionToExecute.generateType === 'continue') {
          onUpdateContent(content + '\n\n' + response.data.generated)
          toast.success('Текст добавлен в документ')
        } else {
          setFeedback(response.data)
        }
      } else if (actionToExecute.type === 'sources') {
        const response = await api.post('/ai/sources', {
          topic: prompt || selectedText || 'Тема исследования',
          count: 5
        })
        setFeedback(response.data)
      } else if (actionToExecute.type === 'analyze') {
        const response = await api.post('/ai/analyze-structure', {
          content: content
        })
        setFeedback(response.data)
      }

      setShowPromptInput(false)
      setPrompt('')
      setCurrentAction(null)
    } catch (error) {
      toast.error('Ошибка при выполнении запроса')
    } finally {
      setLoading(false)
    }
  }

  const openPromptInput = (action: any) => {
    setCurrentAction(action)
    setShowPromptInput(true)
    setPrompt(selectedText || '')
  }

  const assistantOptions = [
    {
      category: 'Проверка текста',
      icon: FiCheck,
      items: [
        { 
          id: 'grammar', 
          label: 'Грамматика и орфография', 
          type: 'check',
          checkType: 'grammar',
          needsPrompt: true
        },
        { 
          id: 'style', 
          label: 'Научный стиль', 
          type: 'check',
          checkType: 'style',
          needsPrompt: true
        },
        { 
          id: 'logic', 
          label: 'Логика изложения', 
          type: 'check',
          checkType: 'logic',
          needsPrompt: true
        },
      ]
    },
    {
      category: 'Генерация контента',
      icon: FiEdit3,
      items: [
        { 
          id: 'continue', 
          label: 'Продолжить текст', 
          type: 'generate',
          generateType: 'continue',
          needsPrompt: true
        },
        { 
          id: 'rephrase', 
          label: 'Перефразировать', 
          type: 'generate',
          generateType: 'rephrase',
          needsPrompt: true
        },
        { 
          id: 'outline', 
          label: 'Создать план', 
          type: 'generate',
          generateType: 'outline',
          needsPrompt: true
        },
      ]
    },
    {
      category: 'Исследование',
      icon: FiBookOpen,
      items: [
        { 
          id: 'sources', 
          label: 'Найти источники', 
          type: 'sources',
          needsPrompt: true
        },
        { 
          id: 'analyze', 
          label: 'Анализ структуры', 
          type: 'analyze',
          needsPrompt: false
        },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiZap className="w-5 h-5 text-primary" />
          AI Ассистент
        </h3>
        <p className="text-sm text-muted mt-1">
          {selectedText ? 'Выделен текст для работы' : 'Выберите функцию или введите запрос'}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {!feedback && !showPromptInput ? (
          <div className="p-6 space-y-6">
            {assistantOptions.map((category) => (
              <div key={category.category}>
                <h4 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
                  <category.icon className="w-4 h-4" />
                  {category.category}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.needsPrompt) {
                          openPromptInput(item)
                        } else {
                          executeAction(item)
                        }
                      }}
                      disabled={loading}
                      className="w-full text-left px-4 py-3 rounded-md bg-secondary hover:bg-secondary/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm text-white">{item.label}</span>
                      {activeFunction === item.id && loading && (
                        <FiRefreshCw className="inline-block ml-2 w-4 h-4 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : showPromptInput ? (
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white">
                  {currentAction?.label}
                </h4>
                <button
                  onClick={() => {
                    setShowPromptInput(false)
                    setPrompt('')
                    setCurrentAction(null)
                  }}
                  className="text-muted hover:text-white"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              {selectedText && (
                <div className="mb-3 p-3 bg-secondary rounded-md">
                  <p className="text-xs text-muted mb-1">Выделенный текст:</p>
                  <p className="text-sm text-white">{selectedText.substring(0, 100)}...</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted">
                  Введите запрос или уточнения:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={selectedText ? "Дополнительные инструкции (опционально)" : "Опишите, что нужно сделать..."}
                  className="input w-full h-32 resize-none"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={executeAction}
                  disabled={loading || (!prompt.trim() && !selectedText)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-4 h-4" />
                      Выполнить
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowPromptInput(false)
                    setPrompt('')
                    setCurrentAction(null)
                  }}
                  className="btn-secondary px-4"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Результат</h4>
              <button
                onClick={() => setFeedback(null)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Закрыть
              </button>
            </div>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="bg-secondary rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {typeof feedback === 'string' ? feedback : 
                feedback.feedback || feedback.generated || feedback.sources || feedback.analysis}
              </div>
            </div>
            
            {feedback.generated && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    onUpdateContent(content + '\n\n' + feedback.generated)
                    toast.success('Текст добавлен в документ')
                    setFeedback(null)
                  }}
                  className="btn-primary flex-1"
                >
                  Добавить в документ
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(feedback.generated)
                    toast.success('Скопировано в буфер обмена')
                  }}
                  className="btn-secondary flex-1"
                >
                  Копировать
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="bg-card rounded-lg p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted">Обработка запроса...</p>
          </div>
        </div>
      )}
    </div>
  )
}