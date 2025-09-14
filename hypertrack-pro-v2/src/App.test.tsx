import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithClient } from './test-utils/renderWithClient';
import '@testing-library/jest-dom';
import App from './App';

test('renders workout logger with select exercise button', () => {
  renderWithClient(<App />);
  const btn = screen.getByRole('button', { name: /select exercise/i });
  expect(btn).toBeInTheDocument();
});
