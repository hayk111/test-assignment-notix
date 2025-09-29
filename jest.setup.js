import '@testing-library/jest-dom';

// Mock global Request and Response for Node.js environment
global.Request = class MockRequest {
  constructor(url, init) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Map();
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        this.headers.set(key, value);
      });
    }
  }
};

global.Response = class MockResponse {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
  }

  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
};

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(url) {
      this.url = url;
    }
  },
  NextResponse: {
    json: (data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      statusText: init?.statusText || 'OK',
    }),
  },
}));
