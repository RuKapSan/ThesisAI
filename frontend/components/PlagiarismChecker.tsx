'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiAlertCircle, FiClock, FiRefreshCw } from 'react-icons/fi'

interface PlagiarismCheckerProps {
  documentId: string
}

interface CheckResult {
  id: string
  originalityScore: number
  report: any
  checkedAt: string
}

export default function PlagiarismChecker({ documentId }: PlagiarismCheckerProps) {
  const [loading, setLoading] = useState(false)
  const [currentCheck, setCurrentCheck] = useState<CheckResult | null>(null)
  const [history, setHistory] = useState<CheckResult[]>([])

  useEffect(() => {
    fetchHistory()
  }, [documentId])

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/plagiarism/history/${documentId}`)
      setHistory(response.data)
      if (response.data.length > 0) {
        fetchReport(response.data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch history')
    }
  }

  const fetchReport = async (checkId: string) => {
    try {
      const response = await api.get(`/plagiarism/report/${checkId}`)
      setCurrentCheck(response.data)
    } catch (error) {
      toast.error('Ошибка при загрузке отчета')
    }
  }

  const runCheck = async () => {
    setLoading(true)
    try {
      const response = await api.post('/plagiarism/check', {
        documentId
      })
      setCurrentCheck(response.data)
      fetchHistory()
      toast.success('Проверка завершена')
    } catch (error) {
      toast.error('Ошибка при проверке')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-success'
    if (score >= 0.7) return 'text-warning'
    return 'text-error'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.9) return <FiCheckCircle className="w-6 h-6 text-success" />
    return <FiAlertCircle className="w-6 h-6 text-warning" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return 'Отличная оригинальность'
    if (score >= 0.7) return 'Хорошая оригинальность'
    return 'Требуется доработка'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FiCheckCircle className="w-5 h-5 text-primary" />
          Проверка оригинальности
        </h3>
        <p className="text-sm text-muted mt-1">Анализ уникальности текста</p>
      </div>

      <div className="flex-1 overflow-auto">
        {currentCheck ? (
          <div className="p-6">
            {/* Score Card */}
            <div className="bg-secondary rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                {getScoreIcon(currentCheck.originalityScore)}
                <div>
                  <div className={`text-3xl font-bold ${getScoreColor(currentCheck.originalityScore)}`}>
                    {(currentCheck.originalityScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted">{getScoreLabel(currentCheck.originalityScore)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Всего слов:</span>
                  <span className="text-white">{currentCheck.report.totalWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Проверено сегментов:</span>
                  <span className="text-white">{currentCheck.report.checkedSegments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Подозрительных:</span>
                  <span className="text-white">{currentCheck.report.flaggedSegments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Проверено:</span>
                  <span className="text-white">{new Date(currentCheck.checkedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Segments */}
            {currentCheck.report.segments && currentCheck.report.segments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-3">Детальный анализ</h4>
                <div className="space-y-3">
                  {currentCheck.report.segments.map((segment: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${
                        segment.isOriginal ? 'bg-success/10 border border-success/20' : 'bg-error/10 border border-error/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-white">
                          Сегмент {segment.index + 1}
                        </span>
                        {!segment.isOriginal && (
                          <span className="text-xs text-error">
                            {(segment.similarity * 100).toFixed(0)}% совпадение
                          </span>
                        )}
                      </div>
                      <p className="text-muted">{segment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FiCheckCircle className="w-16 h-16 text-muted mb-4" />
            <p className="text-white mb-2">Проверка не выполнена</p>
            <p className="text-sm text-muted mb-6">Нажмите кнопку для анализа документа</p>
            <button
              onClick={runCheck}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  Проверить оригинальность
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="p-6 border-t border-border">
          <h4 className="text-sm font-medium text-white mb-3">История проверок</h4>
          <div className="space-y-2 max-h-32 overflow-auto">
            {history.map((check) => (
              <button
                key={check.id}
                onClick={() => fetchReport(check.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  currentCheck?.id === check.id ? 'bg-primary/20 text-white' : 'bg-secondary hover:bg-secondary/80 text-muted hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={getScoreColor(check.originalityScore)}>
                    {(check.originalityScore * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs">
                    {new Date(check.checkedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}