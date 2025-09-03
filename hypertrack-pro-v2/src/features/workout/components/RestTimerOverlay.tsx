import React, { useEffect, useRef, useState } from 'react';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';

interface RestTimerOverlayProps {
  isVisible: boolean;
  duration: number;
  onDismiss: () => void;
  onComplete: () => void;
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const CircularProgress: React.FC<{ progress: number; size: number; strokeWidth: number }>
  = ({ progress, size, strokeWidth }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;
  return (
    <svg width={size} height={size} className="mx-auto mb-6">
      <circle
        stroke="#374151"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#60A5FA"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  isVisible,
  duration,
  onDismiss,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const stopRestTimer = useWorkoutStore((s) => s.stopRestTimer);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setTimeLeft(duration);
  }, [isVisible, duration]);

  useEffect(() => {
    if (!isVisible || paused) return;
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 1;
        if (next <= 0) {
          window.clearInterval(intervalRef.current!);
          try {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            const audio = new Audio(
              'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
            );
            audio.play().catch(() => {});
          } catch {}
          onComplete();
          stopRestTimer();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isVisible, paused, onComplete, stopRestTimer]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="text-center p-6 card"
        onTouchStart={(e) => setTouchStartY(e.changedTouches[0].clientY)}
        onTouchEnd={(e) => {
          if (touchStartY !== null) {
            const delta = e.changedTouches[0].clientY - touchStartY;
            if (delta > 80) {
              stopRestTimer();
              onDismiss();
            }
          }
          setTouchStartY(null);
        }}
      >
        <CircularProgress progress={(duration - timeLeft) / duration} size={220} strokeWidth={10} />
        <div className="text-6xl font-mono text-white mb-8">{formatTime(timeLeft)}</div>
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setPaused((p) => !p)}
            className="h-12 w-12 bg-focus rounded-full active:scale-95"
            aria-label={paused ? 'Resume' : 'Pause'}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <button
            onClick={onDismiss}
            className="h-12 w-12 bg-gray-600 rounded-full active:scale-95"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center space-x-3">
          {[60, 90, 120, 180].map((d) => (
            <button
              key={d}
              className="px-3 py-2 bg-gray-700 rounded active:scale-95"
              onClick={() => setTimeLeft(d)}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};



