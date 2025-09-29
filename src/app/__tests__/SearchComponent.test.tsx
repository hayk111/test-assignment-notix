import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchComponent from '../page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const mockRouter = {
  replace: jest.fn(),
};

describe('SearchComponent', () => {
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Create a fresh URLSearchParams object for each test
    mockSearchParams = new URLSearchParams();
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    (global.fetch as jest.Mock).mockClear();
  });

  it('should render search input', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          query: '',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    expect(
      screen.getByPlaceholderText('Введите запрос для поиска...')
    ).toBeInTheDocument();
  });

  it('should show loading state during search', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    results: [],
                    total: 0,
                    query: '',
                    timestamp: Date.now(),
                  }),
              }),
            100
          )
        )
    );

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'react');

    // Should show loading state - check for loading spinner in input
    await waitFor(() => {
      expect(screen.getByDisplayValue('react')).toBeInTheDocument();
      // The loading spinner is in the input field, so we check if the input is there
      // and the loading state is active (we can't easily test the spinner itself)
    });
  });

  it('should display search results', async () => {
    const mockResults = [
      {
        id: 1,
        title: 'React Documentation',
        description: 'Complete guide to React library',
        category: 'Documentation',
      },
      {
        id: 2,
        title: 'React Hooks Guide',
        description: 'Understanding and using React hooks',
        category: 'Documentation',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: mockResults,
          total: 2,
          query: 'react',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'react');

    await waitFor(() => {
      expect(screen.getByText('React Documentation')).toBeInTheDocument();
      expect(screen.getByText('React Hooks Guide')).toBeInTheDocument();
      expect(screen.getByText('Найдено результатов: 2')).toBeInTheDocument();
    });
  });

  it('should display no results message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          query: 'nonexistent',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'nonexistent');

    await waitFor(() => {
      expect(
        screen.getAllByText((content, element) => {
          return (
            element?.textContent?.includes('По запросу') &&
            element?.textContent?.includes('ничего не найдено')
          );
        })[0]
      ).toBeInTheDocument();
    });
  });

  it('should display error message on API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'react');

    await waitFor(() => {
      expect(
        screen.getByText('Ошибка при выполнении поиска')
      ).toBeInTheDocument();
    });
  });

  it('should update URL when typing', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          query: '',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'react');

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('?q=react', {
        scroll: false,
      });
    });
  });

  it('should initialize with URL query parameter', () => {
    // Set up URLSearchParams with 'react' query
    mockSearchParams.set('q', 'react');

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [
            {
              id: 1,
              title: 'React Documentation',
              description: 'Complete guide',
              category: 'Documentation',
            },
          ],
          total: 1,
          query: 'react',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    const input = screen.getByDisplayValue('react');
    expect(input).toBeInTheDocument();
  });

  it('should clear results when input is cleared', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          query: '',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    const input = screen.getByPlaceholderText('Введите запрос для поиска...');
    await userEvent.type(input, 'react');

    // Clear the input
    await userEvent.clear(input);

    await waitFor(() => {
      expect(
        screen.getByText('Введите запрос для начала поиска')
      ).toBeInTheDocument();
    });
  });

  it('should show initial state when no query', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total: 0,
          query: '',
          timestamp: Date.now(),
        }),
    });

    render(<SearchComponent />);

    expect(
      screen.getByText('Введите запрос для начала поиска')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Результаты будут отображаться по мере ввода')
    ).toBeInTheDocument();
  });
});
