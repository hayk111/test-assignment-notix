import { NextRequest, NextResponse } from 'next/server';

const mockData = [
  {
    id: 1,
    title: 'React Documentation',
    description: 'Complete guide to React library',
    category: 'Documentation',
  },
  {
    id: 2,
    title: 'TypeScript Handbook',
    description: 'Learn TypeScript from basics to advanced',
    category: 'Documentation',
  },
  {
    id: 3,
    title: 'Next.js Tutorial',
    description: 'Build modern web applications with Next.js',
    category: 'Tutorial',
  },
  {
    id: 4,
    title: 'JavaScript Fundamentals',
    description: 'Core concepts of JavaScript programming',
    category: 'Tutorial',
  },
  {
    id: 5,
    title: 'CSS Grid Layout',
    description: 'Modern CSS layout techniques',
    category: 'Tutorial',
  },
  {
    id: 6,
    title: 'Node.js API Development',
    description: 'Building REST APIs with Node.js',
    category: 'Tutorial',
  },
  {
    id: 7,
    title: 'React Hooks Guide',
    description: 'Understanding and using React hooks',
    category: 'Documentation',
  },
  {
    id: 8,
    title: 'Web Performance Optimization',
    description: 'Techniques to improve web performance',
    category: 'Guide',
  },
  {
    id: 9,
    title: 'Git Version Control',
    description: 'Master Git for version control',
    category: 'Tutorial',
  },
  {
    id: 10,
    title: 'Docker Containerization',
    description: 'Containerize your applications with Docker',
    category: 'Tutorial',
  },
  {
    id: 11,
    title: 'React Native Development',
    description: 'Build mobile apps with React Native',
    category: 'Tutorial',
  },
  {
    id: 12,
    title: 'GraphQL API Design',
    description: 'Design efficient GraphQL APIs',
    category: 'Tutorial',
  },
  {
    id: 13,
    title: 'Vue.js Framework',
    description: 'Progressive JavaScript framework',
    category: 'Documentation',
  },
  {
    id: 14,
    title: 'Angular Development',
    description: 'Enterprise-grade web applications',
    category: 'Tutorial',
  },
  {
    id: 15,
    title: 'Webpack Module Bundler',
    description: 'Bundle your JavaScript modules',
    category: 'Tool',
  },
];

export interface SearchResult {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const delay = parseInt(searchParams.get('delay') || '0');

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (!query.trim()) {
    return NextResponse.json({
      results: [],
      total: 0,
      query: '',
      timestamp: Date.now(),
    } as SearchResponse);
  }

  const normalizedQuery = query.trim().toLowerCase();

  const filteredResults = mockData.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery)
  );

  const randomDelay = Math.random() * 500 + 100; // 100-600ms
  await new Promise((resolve) => setTimeout(resolve, randomDelay));

  return NextResponse.json({
    results: filteredResults,
    total: filteredResults.length,
    query: normalizedQuery,
    timestamp: Date.now(),
  } as SearchResponse);
}
