import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Editor from '@/components/Editor';

// Mock TipTap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleCode: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        setLink: jest.fn(() => ({ run: jest.fn() })),
        setParagraph: jest.fn(() => ({ run: jest.fn() })),
        toggleHeading: jest.fn(() => ({ run: jest.fn() })),
      })),
    })),
    isActive: jest.fn(),
    getHTML: jest.fn(() => '<p>Test content</p>'),
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor Content</div>,
}));

describe('Editor Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders editor with toolbar', () => {
    render(<Editor content="Test content" onChange={mockOnChange} />);
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
  });

  it('handles formatting button clicks', async () => {
    const { useEditor } = require('@tiptap/react');
    const mockEditor = useEditor();
    
    render(<Editor content="Test content" onChange={mockOnChange} />);
    
    const boldButton = screen.getAllByRole('button')[0];
    fireEvent.click(boldButton);
    
    expect(mockEditor.chain).toHaveBeenCalled();
  });

  it('handles link addition', async () => {
    const user = userEvent.setup();
    window.prompt = jest.fn(() => 'https://example.com');
    
    render(<Editor content="Test content" onChange={mockOnChange} />);
    
    const linkButton = screen.getAllByRole('button')[4];
    await user.click(linkButton);
    
    expect(window.prompt).toHaveBeenCalledWith('Enter URL:');
  });

  it('handles heading selection', async () => {
    const { useEditor } = require('@tiptap/react');
    const mockEditor = useEditor();
    
    render(<Editor content="Test content" onChange={mockOnChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });
    
    expect(mockEditor.chain).toHaveBeenCalled();
  });

  it('calls onChange when content updates', () => {
    const { useEditor } = require('@tiptap/react');
    
    // Simulate editor update
    useEditor.mockImplementation((config: any) => {
      // Call the onUpdate callback
      setTimeout(() => {
        config.onUpdate({ editor: { getHTML: () => '<p>Updated content</p>' } });
      }, 0);
      
      return {
        chain: jest.fn(() => ({
          focus: jest.fn(() => ({
            toggleBold: jest.fn(() => ({ run: jest.fn() })),
          })),
        })),
        isActive: jest.fn(),
        getHTML: jest.fn(() => '<p>Updated content</p>'),
      };
    });
    
    render(<Editor content="Test content" onChange={mockOnChange} />);
    
    waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('<p>Updated content</p>');
    });
  });
});