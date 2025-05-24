import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlagiarismChecker from '@/components/PlagiarismChecker';
import api from '@/lib/api';
import toast from 'react-hot-toast';

jest.mock('@/lib/api');
jest.mock('react-hot-toast');

const mockApi = api as jest.Mocked<typeof api>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('PlagiarismChecker Component', () => {
  const documentId = 'test-doc-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders plagiarism checker interface', () => {
    mockApi.get.mockResolvedValue({ data: [] });
    
    render(<PlagiarismChecker documentId={documentId} />);
    
    expect(screen.getByText('Run Check')).toBeInTheDocument();
    expect(screen.getByText('Check History')).toBeInTheDocument();
  });

  it('fetches and displays check history on mount', async () => {
    const mockHistory = [
      {
        id: 'check1',
        originalityScore: 0.85,
        checkedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'check2',
        originalityScore: 0.92,
        checkedAt: '2024-01-02T00:00:00Z'
      }
    ];

    mockApi.get.mockImplementation((url) => {
      if (url.includes('/history/')) {
        return Promise.resolve({ data: mockHistory });
      }
      if (url.includes('/report/')) {
        return Promise.resolve({
          data: {
            id: 'check1',
            originalityScore: 0.85,
            report: {
              totalWords: 100,
              checkedSegments: 5,
              flaggedSegments: 1
            },
            checkedAt: '2024-01-01T00:00:00Z'
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PlagiarismChecker documentId={documentId} />);

    await waitFor(() => {
      expect(screen.getByText('85.0%')).toBeInTheDocument();
      expect(screen.getByText('92.0%')).toBeInTheDocument();
    });
  });

  it('runs plagiarism check successfully', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    mockApi.post.mockResolvedValue({
      data: {
        id: 'new-check',
        originalityScore: 0.88,
        report: {
          originalityScore: 0.88,
          totalWords: 150,
          checkedSegments: 8,
          flaggedSegments: 2,
          segments: []
        },
        checkedAt: new Date().toISOString()
      }
    });
    mockToast.success = jest.fn();

    render(<PlagiarismChecker documentId={documentId} />);
    
    const runCheckButton = screen.getByText('Run Check');
    fireEvent.click(runCheckButton);

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/plagiarism/check', {
        documentId
      });
      expect(mockToast.success).toHaveBeenCalledWith('Plagiarism check completed');
      expect(screen.getByText('88.0%')).toBeInTheDocument();
      expect(screen.getByText('Original Content')).toBeInTheDocument();
    });
  });

  it('handles check errors gracefully', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    mockApi.post.mockRejectedValue(new Error('API Error'));
    mockToast.error = jest.fn();

    render(<PlagiarismChecker documentId={documentId} />);
    
    const runCheckButton = screen.getByText('Run Check');
    fireEvent.click(runCheckButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to run plagiarism check');
    });
  });

  it('displays detailed report with segments', async () => {
    const mockReport = {
      id: 'check1',
      originalityScore: 0.75,
      report: {
        originalityScore: 0.75,
        totalWords: 200,
        checkedSegments: 10,
        flaggedSegments: 3,
        segments: [
          {
            index: 0,
            text: 'Original content...',
            isOriginal: true,
            similarity: 0
          },
          {
            index: 1,
            text: 'Potentially copied...',
            isOriginal: false,
            similarity: 0.3
          }
        ]
      },
      checkedAt: new Date().toISOString()
    };

    mockApi.get.mockImplementation((url) => {
      if (url.includes('/history/')) {
        return Promise.resolve({ data: [{ id: 'check1', originalityScore: 0.75, checkedAt: mockReport.checkedAt }] });
      }
      if (url.includes('/report/')) {
        return Promise.resolve({ data: mockReport });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PlagiarismChecker documentId={documentId} />);

    await waitFor(() => {
      expect(screen.getByText('75.0%')).toBeInTheDocument();
      expect(screen.getByText('Total Words:')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      expect(screen.getByText('Original content...')).toBeInTheDocument();
      expect(screen.getByText('Potentially copied...')).toBeInTheDocument();
      expect(screen.getByText('30% similar')).toBeInTheDocument();
    });
  });

  it('switches between different check reports', async () => {
    const mockHistory = [
      { id: 'check1', originalityScore: 0.85, checkedAt: '2024-01-01T00:00:00Z' },
      { id: 'check2', originalityScore: 0.92, checkedAt: '2024-01-02T00:00:00Z' }
    ];

    mockApi.get.mockImplementation((url) => {
      if (url.includes('/history/')) {
        return Promise.resolve({ data: mockHistory });
      }
      if (url.includes('/report/check1')) {
        return Promise.resolve({
          data: {
            id: 'check1',
            originalityScore: 0.85,
            report: { totalWords: 100 },
            checkedAt: '2024-01-01T00:00:00Z'
          }
        });
      }
      if (url.includes('/report/check2')) {
        return Promise.resolve({
          data: {
            id: 'check2',
            originalityScore: 0.92,
            report: { totalWords: 200 },
            checkedAt: '2024-01-02T00:00:00Z'
          }
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<PlagiarismChecker documentId={documentId} />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    // Click on second check
    const secondCheck = screen.getByText('92.0%');
    fireEvent.click(secondCheck);

    await waitFor(() => {
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  it('shows loading state during check', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PlagiarismChecker documentId={documentId} />);
    
    const runCheckButton = screen.getByText('Run Check');
    fireEvent.click(runCheckButton);

    expect(screen.getByText('Running plagiarism check...')).toBeInTheDocument();
    expect(runCheckButton).toHaveTextContent('Checking...');
  });

  it('displays appropriate score colors', async () => {
    const reports = [
      { score: 0.95, expectedClass: 'text-green-500' },
      { score: 0.75, expectedClass: 'text-yellow-500' },
      { score: 0.65, expectedClass: 'text-red-500' }
    ];

    for (const { score, expectedClass } of reports) {
      mockApi.get.mockResolvedValue({ data: [] });
      mockApi.post.mockResolvedValue({
        data: {
          id: 'check',
          originalityScore: score,
          report: { originalityScore: score },
          checkedAt: new Date().toISOString()
        }
      });

      const { unmount } = render(<PlagiarismChecker documentId={documentId} />);
      
      const runCheckButton = screen.getByText('Run Check');
      fireEvent.click(runCheckButton);

      await waitFor(() => {
        const scoreElement = screen.getByText(`${(score * 100).toFixed(1)}%`);
        expect(scoreElement).toHaveClass(expectedClass);
      });

      unmount();
    }
  });
});