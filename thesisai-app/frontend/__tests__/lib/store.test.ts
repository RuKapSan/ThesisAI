import { renderHook, act } from '@testing-library/react';
import { useAuthStore, useDocumentsStore } from '@/lib/store';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles login correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockToken = 'test-token';
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'STUDENT'
    };

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles logout correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    // First login
    act(() => {
      result.current.login('test-token', {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'STUDENT'
      });
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('persists state to localStorage', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockToken = 'persistent-token';
    const mockUser = {
      id: 'user-456',
      email: 'persist@example.com',
      name: 'Persistent User',
      role: 'TEACHER'
    };

    act(() => {
      result.current.login(mockToken, mockUser);
    });

    // Check that localStorage.setItem was called
    expect(localStorageMock.setItem).toHaveBeenCalled();
    const [key, value] = localStorageMock.setItem.mock.calls[0];
    expect(key).toBe('auth-storage');
    
    const parsedValue = JSON.parse(value);
    expect(parsedValue.state.token).toBe(mockToken);
    expect(parsedValue.state.user).toEqual(mockUser);
  });
});

describe('useDocumentsStore', () => {
  beforeEach(() => {
    useDocumentsStore.setState({
      documents: [],
      currentDocument: null
    });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useDocumentsStore());
    
    expect(result.current.documents).toEqual([]);
    expect(result.current.currentDocument).toBeNull();
  });

  it('sets documents correctly', () => {
    const { result } = renderHook(() => useDocumentsStore());
    
    const mockDocuments = [
      {
        id: 'doc1',
        title: 'Document 1',
        type: 'COURSEWORK',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'doc2',
        title: 'Document 2',
        type: 'THESIS',
        updatedAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ];

    act(() => {
      result.current.setDocuments(mockDocuments);
    });

    expect(result.current.documents).toEqual(mockDocuments);
  });

  it('sets current document correctly', () => {
    const { result } = renderHook(() => useDocumentsStore());
    
    const mockDocument = {
      id: 'doc1',
      title: 'Current Document',
      content: '# Test Content',
      type: 'ESSAY',
      userId: 'user123',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    act(() => {
      result.current.setCurrentDocument(mockDocument);
    });

    expect(result.current.currentDocument).toEqual(mockDocument);
  });

  it('clears documents correctly', () => {
    const { result } = renderHook(() => useDocumentsStore());
    
    // First set some data
    act(() => {
      result.current.setDocuments([
        {
          id: 'doc1',
          title: 'Document 1',
          type: 'REPORT',
          updatedAt: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);
      result.current.setCurrentDocument({
        id: 'doc1',
        title: 'Document 1',
        content: 'Content',
        type: 'REPORT',
        userId: 'user123',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Then clear
    act(() => {
      result.current.clearDocuments();
    });

    expect(result.current.documents).toEqual([]);
    expect(result.current.currentDocument).toBeNull();
  });

  it('maintains separate state for different store instances', () => {
    const { result: authResult } = renderHook(() => useAuthStore());
    const { result: docsResult } = renderHook(() => useDocumentsStore());

    act(() => {
      authResult.current.login('token', {
        id: 'user1',
        email: 'test@example.com',
        name: 'Test',
        role: 'STUDENT'
      });
      docsResult.current.setDocuments([{
        id: 'doc1',
        title: 'Doc 1',
        type: 'ESSAY',
        updatedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      }]);
    });

    expect(authResult.current.isAuthenticated).toBe(true);
    expect(docsResult.current.documents).toHaveLength(1);
  });
});