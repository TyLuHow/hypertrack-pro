import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WorkoutLogger } from '../workout/components/WorkoutLogger';

test('WorkoutLogger renders and opens selector', () => {
  const onExerciseSelect = jest.fn();
  const onStartRestTimer = jest.fn();
  render(<WorkoutLogger onExerciseSelect={onExerciseSelect} onStartRestTimer={onStartRestTimer} />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(onExerciseSelect).toHaveBeenCalled();
});


