import './index.css';
import { WorkoutLogger } from './features/workout/components/WorkoutLogger';
import { ExerciseSelector } from './features/exercises/components/ExerciseSelector';
import { RestTimerOverlay } from './features/workout/components/RestTimerOverlay';
import React from 'react';
import { useWorkoutStore } from './shared/stores/workoutStore';

function App() {
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [timerVisible, setTimerVisible] = React.useState(false);
  const [timerDuration, setTimerDuration] = React.useState(90);
  const selectExercise = useWorkoutStore((s) => s.selectExercise);

  return (
    <div className="bg-background min-h-screen">
      <WorkoutLogger
        onExerciseSelect={() => setSelectorOpen(true)}
        onStartRestTimer={(d) => { setTimerDuration(d); setTimerVisible(true); }}
      />
      <ExerciseSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(exerciseId, _name) => {
          selectExercise(exerciseId);
          setSelectorOpen(false);
        }}
      />
      <RestTimerOverlay
        isVisible={timerVisible}
        duration={timerDuration}
        onDismiss={() => setTimerVisible(false)}
        onComplete={() => setTimerVisible(false)}
      />
    </div>
  );
}

export default App;
