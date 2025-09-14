import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false, staleTime: 0 },
  },
});

jest.mock('@testing-library/react', () => {
  const actual = jest.requireActual('@testing-library/react');
  return {
    ...actual,
    render: (ui: React.ReactElement, options?: any) => {
      return actual.render(
        <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>,
        options
      );
    },
  };
});

const originalError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('No QueryClient set')) return;
  // @ts-ignore
  originalError(...(args as any));
};



