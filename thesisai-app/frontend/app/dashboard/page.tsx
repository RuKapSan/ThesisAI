'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiPlus, FiFile, FiLogOut, FiEdit, FiTrash } from 'react-icons/fi'
import { useAuthStore, useDocumentsStore } from '@/lib/store'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuthStore()
  const { documents, setDocuments } = useDocumentsStore()
  const [loading, setLoading] = useState(true)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'COURSEWORK'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchDocuments()
  }, [isAuthenticated])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents')
      setDocuments(response.data)
    } catch (error) {
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async () => {
    try {
      const response = await api.post('/documents', {
        ...newDoc,
        content: `# ${newDoc.title}\n\n`
      })
      toast.success('Document created')
      setShowNewModal(false)
      setNewDoc({ title: '', type: 'COURSEWORK' })
      fetchDocuments()
      router.push(`/editor/${response.data.id}`)
    } catch (error) {
      toast.error('Failed to create document')
    }
  }

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      fetchDocuments()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary">ThesisAI</h1>
            <div className="flex items-center gap-4">
              <span className="text-muted">Hello, {user?.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-muted hover:text-white">
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">My Documents</h2>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> New Document
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FiFile className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-xl text-muted mb-4">No documents yet</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary"
            >
              Create your first document
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="card hover:border-primary transition-colors">
                <h3 className="text-xl font-semibold mb-2">{doc.title}</h3>
                <p className="text-sm text-muted mb-4">
                  {doc.type} • Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/editor/${doc.id}`}
                    className="btn-primary flex-1 text-center flex items-center justify-center gap-2"
                  >
                    <FiEdit /> Edit
                  </Link>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="btn-secondary px-3"
                  >
                    <FiTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">New Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="input w-full"
                  placeholder="My Academic Paper"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  className="input w-full"
                >
                  <option value="COURSEWORK">Coursework</option>
                  <option value="THESIS">Thesis</option>
                  <option value="ESSAY">Essay</option>
                  <option value="REPORT">Report</option>
                  <option value="ARTICLE">Article</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createDocument}
                  disabled={!newDoc.title}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}