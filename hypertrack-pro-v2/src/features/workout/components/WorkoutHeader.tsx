import React, { useEffect, useState } from 'react';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';

export const WorkoutHeader: React.FC = () => {
  const { currentWorkout, setWorkoutName } = useWorkoutStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleNameEdit = () => {
    if (currentWorkout) {
      setEditedName(currentWorkout.name || 'Workout');
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    if (editedName.trim()) {
      setWorkoutName(editedName.trim());
    }
    setIsEditingName(false);
  };

  if (!currentWorkout) return null;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="bg-slate-600 text-white px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
              <button onClick={handleNameSave} className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm">Save</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{currentWorkout.name || 'Workout'}</h1>
              <button onClick={handleNameEdit} className="p-1 text-gray-400 hover:text-white transition-colors">✏️</button>
            </div>
          )}
          <p className="text-gray-300 text-sm mt-1">
            {new Date(currentWorkout.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' })} • {currentWorkout.exercises.length} exercises
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Duration</div>
          <div className="text-lg font-semibold text-white">
            <WorkoutTimer startTime={new Date(currentWorkout.startTime)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkoutTimer: React.FC<{ startTime: Date }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return <span>{minutes}:{String(seconds).padStart(2, '0')}</span>;
};


