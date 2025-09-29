import { GET } from '../route';

// Mock NextRequest with a simpler approach
const createMockRequest = (url: string) => {
  const mockRequest = {
    url: url,
    method: 'GET',
    headers: new Map(),
  };
  return mockRequest as any;
};

describe('/api/search', () => {
  it('should return empty results for empty query', async () => {
    const request = createMockRequest('http://localhost:3000/api/search?q=');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.query).toBe('');
  });

  it('should return empty results for whitespace-only query', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=%20%20'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.query).toBe('');
  });

  it('should find React-related results', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=react'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    expect(data.query).toBe('react');

    // Should find React Documentation and React Hooks Guide
    const titles = data.results.map((result: any) => result.title);
    expect(titles).toContain('React Documentation');
    expect(titles).toContain('React Hooks Guide');
  });

  it('should find results by description', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=hooks'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.length).toBeGreaterThan(0);

    // Should find React Hooks Guide
    const titles = data.results.map((result: any) => result.title);
    expect(titles).toContain('React Hooks Guide');
  });

  it('should find results by category', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=documentation'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.length).toBeGreaterThan(0);

    // All results should have Documentation category
    data.results.forEach((result: any) => {
      expect(result.category).toBe('Documentation');
    });
  });

  it('should handle case-insensitive search', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=REACT'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.length).toBeGreaterThan(0);

    const titles = data.results.map((result: any) => result.title);
    expect(titles).toContain('React Documentation');
  });

  it('should handle queries with leading/trailing spaces', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=%20%20react%20%20'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.query).toBe('react'); // Should be normalized
  });

  it('should return no results for non-existent query', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=xyz123nonexistent'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
  });

  it('should include timestamp in response', async () => {
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=react'
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(typeof data.timestamp).toBe('number');
    expect(data.timestamp).toBeGreaterThan(0);
  });

  it('should handle delay parameter', async () => {
    const startTime = Date.now();
    const request = createMockRequest(
      'http://localhost:3000/api/search?q=react&delay=100'
    );
    const response = await GET(request);
    const endTime = Date.now();

    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);
  });
});
