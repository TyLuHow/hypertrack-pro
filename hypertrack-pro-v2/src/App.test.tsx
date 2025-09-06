import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders workout logger with select exercise button', () => {
  render(<App />);
  const btn = screen.getByRole('button', { name: /select exercise/i });
  expect(btn).toBeInTheDocument();
});
