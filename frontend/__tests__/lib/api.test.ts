import axios from 'axios';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth store
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false
    });
    // Reset window location
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('creates axios instance with correct base URL', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:3001/api'
    });
  });

  it('adds auth token to requests when authenticated', async () => {
    const mockToken = 'test-auth-token';
    const mockInterceptor = jest.fn((config) => {
      return config;
    });

    // Set up auth state
    useAuthStore.setState({
      token: mockToken,
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'STUDENT' },
      isAuthenticated: true
    });

    // Get the request interceptor that was registered
    const createCall = mockedAxios.create.mock.calls[0];
    expect(createCall).toBeDefined();

    // Mock the interceptors
    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn((callback) => {
            // Test the callback with a mock config
            const config = { headers: {} };
            const result = callback(config);
            expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
          })
        },
        response: {
          use: jest.fn()
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockInstance as any);

    // Re-import to trigger interceptor setup
    jest.resetModules();
    require('@/lib/api');

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('handles 401 responses by logging out and redirecting', async () => {
    const mockLogout = jest.fn();
    useAuthStore.setState({
      token: 'expired-token',
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'STUDENT' },
      isAuthenticated: true,
      logout: mockLogout
    });

    // Mock the interceptors
    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn((successHandler, errorHandler) => {
            // Test the error handler with a 401 response
            const error = {
              response: { status: 401 }
            };
            
            const result = errorHandler(error);
            
            result.catch(() => {
              // Check that logout was called
              const state = useAuthStore.getState();
              expect(state.isAuthenticated).toBe(false);
              expect(window.location.href).toBe('/login');
            });
          })
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockInstance as any);

    // Re-import to trigger interceptor setup
    jest.resetModules();
    require('@/lib/api');

    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('passes through non-401 errors', async () => {
    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn((successHandler, errorHandler) => {
            // Test with a different error
            const error = {
              response: { status: 500, data: { error: 'Server Error' } }
            };
            
            const result = errorHandler(error);
            
            expect(result).rejects.toEqual(error);
          })
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockInstance as any);

    // Re-import to trigger interceptor setup
    jest.resetModules();
    require('@/lib/api');

    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  it('handles requests without auth token', async () => {
    // Ensure no token is set
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false
    });

    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn((callback) => {
            const config = { headers: {} };
            const result = callback(config);
            expect(result.headers.Authorization).toBeUndefined();
          })
        },
        response: {
          use: jest.fn()
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockInstance as any);

    // Re-import to trigger interceptor setup
    jest.resetModules();
    require('@/lib/api');

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('preserves existing headers when adding auth token', async () => {
    useAuthStore.setState({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', name: 'Test', role: 'STUDENT' },
      isAuthenticated: true
    });

    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn((callback) => {
            const config = {
              headers: {
                'Content-Type': 'application/json',
                'X-Custom-Header': 'custom-value'
              }
            };
            const result = callback(config);
            expect(result.headers['Content-Type']).toBe('application/json');
            expect(result.headers['X-Custom-Header']).toBe('custom-value');
            expect(result.headers.Authorization).toBe('Bearer test-token');
          })
        },
        response: {
          use: jest.fn()
        }
      }
    };

    mockedAxios.create.mockReturnValue(mockInstance as any);

    // Re-import to trigger interceptor setup
    jest.resetModules();
    require('@/lib/api');

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
  });
});