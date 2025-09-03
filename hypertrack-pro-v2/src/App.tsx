import './index.css';
import { WorkoutLogger } from './features/workout/components/WorkoutLogger';
import { ExerciseSelector } from './features/exercises/components/ExerciseSelector';
import { RestTimerOverlay } from './features/workout/components/RestTimerOverlay';
import { BottomTabs, TabKey } from './features/shared/components/BottomTabs';
import { HistoryView } from './features/history/components/HistoryView';
import { AnalyticsView } from './features/progress/components/AnalyticsView';
import { SettingsView } from './features/settings/components/SettingsView';
import { WorkoutHeader } from './features/workout/components/WorkoutHeader';
import { ResearchFactsBanner } from './features/research/components/ResearchFactsBanner';
import { InstallPrompt } from './features/pwa/components/InstallPrompt';
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
      <ResearchFactsBanner />
      {tab === 'workout' && (
        <>
          <WorkoutHeader />
          <WorkoutLogger
            onExerciseSelect={() => setSelectorOpen(true)}
            onStartRestTimer={(d) => { setTimerDuration(d); setTimerVisible(true); }}
          />
        </>
      )}
      {tab === 'history' && <HistoryView />}
      {tab === 'progress' && <AnalyticsView />}
      {tab === 'settings' && <SettingsView />}
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
      <InstallPrompt />
    </div>
  );
}

export default App;
