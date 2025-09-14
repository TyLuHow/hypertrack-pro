import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithClient } from '../../test-utils/renderWithClient';
import { act } from 'react-dom/test-utils';
import { useWorkoutStore } from '../../shared/stores/workoutStore';
import '@testing-library/jest-dom';
import { WorkoutLogger } from '../workout/components/WorkoutLogger';

test('WorkoutLogger renders and opens selector', () => {
  const onExerciseSelect = jest.fn();
  const onStartRestTimer = jest.fn();
  act(() => {
    useWorkoutStore.getState().startWorkout('Test');
  });
  renderWithClient(<WorkoutLogger onExerciseSelect={onExerciseSelect} onStartRestTimer={onStartRestTimer} />);
  const button = screen.getByRole('button', { name: /select exercise/i });
  fireEvent.click(button);
  expect(onExerciseSelect).toHaveBeenCalled();
});


