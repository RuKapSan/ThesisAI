import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface Document {
  id: string
  title: string
  type: string
  updatedAt: string
  createdAt: string
}

interface DocumentsState {
  documents: Document[]
  currentDocument: any | null
  setDocuments: (documents: Document[]) => void
  setCurrentDocument: (document: any) => void
  clearDocuments: () => void
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  documents: [],
  currentDocument: null,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document }),
  clearDocuments: () => set({ documents: [], currentDocument: null }),
}))