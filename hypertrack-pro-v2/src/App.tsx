import './index.css';
import { WorkoutLogger } from './features/workout/components/WorkoutLogger';
import { ExerciseSelector } from './features/exercises/components/ExerciseSelector';
import { RestTimerOverlay } from './features/workout/components/RestTimerOverlay';
import { BottomTabs, TabKey } from './features/shared/components/BottomTabs';
import { HistoryView } from './features/history/components/HistoryView';
import { AnalyticsView } from './features/progress/components/AnalyticsView';
import React from 'react';
import { useWorkoutStore } from './shared/stores/workoutStore';

function App() {
  const [selectorOpen, setSelectorOpen] = React.useState(false);
  const [timerVisible, setTimerVisible] = React.useState(false);
  const [timerDuration, setTimerDuration] = React.useState(90);
  const [tab, setTab] = React.useState<TabKey>('workout');
  const selectExercise = useWorkoutStore((s) => s.selectExercise);

  return (
    <div className="bg-background min-h-screen pb-16">
      {tab === 'workout' && (
        <WorkoutLogger
          onExerciseSelect={() => setSelectorOpen(true)}
          onStartRestTimer={(d) => { setTimerDuration(d); setTimerVisible(true); }}
        />
      )}
      {tab === 'history' && <HistoryView />}
      {tab === 'progress' && <AnalyticsView />}
      {tab === 'settings' && (
        <div className="p-4 text-textPrimary">
          <div className="text-xl font-semibold mb-3">Settings</div>
          <div className="card p-4">Settings coming soon.</div>
        </div>
      )}
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
      <BottomTabs active={tab} onChange={setTab} />
    </div>
  );
}

export default App;
