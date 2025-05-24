import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIAssistant from '@/components/AIAssistant';
import api from '@/lib/api';
import toast from 'react-hot-toast';

jest.mock('@/lib/api');
jest.mock('react-hot-toast');

const mockApi = api as jest.Mocked<typeof api>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('AIAssistant Component', () => {
  const mockOnUpdateContent = jest.fn();
  const testContent = 'This is test content for the AI assistant.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders AI assistant interface', () => {
    render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
    
    expect(screen.getByText('Text Checking')).toBeInTheDocument();
    expect(screen.getByText('Content Generation')).toBeInTheDocument();
    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  describe('Text Checking', () => {
    it('checks grammar successfully', async () => {
      mockApi.post.mockResolvedValue({
        data: {
          type: 'grammar',
          feedback: 'No grammar errors found.'
        }
      });

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const grammarButton = screen.getByText('Grammar & Spelling');
      fireEvent.click(grammarButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/ai/check', {
          text: testContent,
          type: 'grammar'
        });
        expect(screen.getByText('No grammar errors found.')).toBeInTheDocument();
      });
    });

    it('shows error when no content', async () => {
      mockToast.error = jest.fn();
      
      render(<AIAssistant content="" onUpdateContent={mockOnUpdateContent} />);
      
      const grammarButton = screen.getByText('Grammar & Spelling');
      fireEvent.click(grammarButton);

      expect(mockToast.error).toHaveBeenCalledWith('Please select some text or write content first');
    });

    it('handles API errors gracefully', async () => {
      mockApi.post.mockRejectedValue(new Error('API Error'));
      mockToast.error = jest.fn();

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const styleButton = screen.getByText('Academic Style');
      fireEvent.click(styleButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Failed to check text');
      });
    });
  });

  describe('Content Generation', () => {
    it('continues writing successfully', async () => {
      mockApi.post.mockResolvedValue({
        data: {
          type: 'continue',
          generated: 'Continued text here.'
        }
      });
      mockToast.success = jest.fn();

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const continueButton = screen.getByText('Continue Writing');
      fireEvent.click(continueButton);

      await waitFor(() => {
        expect(mockOnUpdateContent).toHaveBeenCalledWith(testContent + '\n\n' + 'Continued text here.');
        expect(mockToast.success).toHaveBeenCalledWith('Content generated');
      });
    });

    it('generates outline', async () => {
      mockApi.post.mockResolvedValue({
        data: {
          type: 'outline',
          generated: '1. Introduction\n2. Main Body\n3. Conclusion'
        }
      });

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const outlineButton = screen.getByText('Generate Outline');
      fireEvent.click(outlineButton);

      await waitFor(() => {
        expect(screen.getByText(/Introduction/)).toBeInTheDocument();
      });
    });
  });

  describe('Research Functions', () => {
    it('finds sources with user input', async () => {
      window.prompt = jest.fn(() => 'Machine Learning');
      mockApi.post.mockResolvedValue({
        data: {
          topic: 'Machine Learning',
          sources: 'Source 1: ...\nSource 2: ...'
        }
      });

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const sourcesButton = screen.getByText('Find Sources');
      fireEvent.click(sourcesButton);

      await waitFor(() => {
        expect(window.prompt).toHaveBeenCalledWith('Enter research topic:');
        expect(mockApi.post).toHaveBeenCalledWith('/ai/sources', {
          topic: 'Machine Learning',
          count: 5
        });
      });
    });

    it('cancels source finding when no topic entered', async () => {
      window.prompt = jest.fn(() => null);

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const sourcesButton = screen.getByText('Find Sources');
      fireEvent.click(sourcesButton);

      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('analyzes document structure', async () => {
      mockApi.post.mockResolvedValue({
        data: {
          analysis: 'Structure analysis: Good introduction, needs more detail in methodology.'
        }
      });

      render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
      
      const analyzeButton = screen.getByText('Analyze Structure');
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/Structure analysis/)).toBeInTheDocument();
      });
    });
  });

  it('shows loading state during API calls', async () => {
    mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
    
    const button = screen.getByText('Grammar & Spelling');
    fireEvent.click(button);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('clears feedback when clear button clicked', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        type: 'grammar',
        feedback: 'Test feedback'
      }
    });

    render(<AIAssistant content={testContent} onUpdateContent={mockOnUpdateContent} />);
    
    const grammarButton = screen.getByText('Grammar & Spelling');
    fireEvent.click(grammarButton);

    await waitFor(() => {
      expect(screen.getByText('Test feedback')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(screen.queryByText('Test feedback')).not.toBeInTheDocument();
  });
});