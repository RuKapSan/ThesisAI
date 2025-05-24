import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginPage from '@/app/login/page';
import { useAuthStore } from '@/lib/store';
import axios from 'axios';
import toast from 'react-hot-toast';

jest.mock('axios');
jest.mock('react-hot-toast');

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false
    });
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('ThesisAI')).toBeInTheDocument();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'test-token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'STUDENT'
        }
      }
    };

    mockAxios.post.mockResolvedValue(mockResponse);
    mockToast.success = jest.fn();

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      
      const authState = useAuthStore.getState();
      expect(authState.token).toBe('test-token');
      expect(authState.user).toEqual(mockResponse.data.user);
      expect(authState.isAuthenticated).toBe(true);
    });
  });

  it('handles login failure with error message', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    });
    mockToast.error = jest.fn();

    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
      expect(mockPush).not.toHaveBeenCalled();
      
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  it('handles network errors', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockRejectedValue(new Error('Network error'));
    mockToast.error = jest.fn();

    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Login failed');
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    mockAxios.post.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(loginButton);

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: 'Login' });
    await user.click(loginButton);

    // Browser should handle HTML5 validation
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it('links to registration page', () => {
    render(<LoginPage />);
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toHaveAttribute('href', '/register');
  });

  it('links back to home page', () => {
    render(<LoginPage />);
    
    const homeLink = screen.getByText('ThesisAI');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});