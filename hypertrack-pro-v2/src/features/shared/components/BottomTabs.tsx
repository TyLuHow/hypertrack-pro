import React from 'react';

export type TabKey = 'workout' | 'history' | 'progress' | 'settings';

interface BottomTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TabButton: React.FC<{
  tab: TabKey;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ tab, label, active, onClick }) => (
  <button
    aria-current={active ? 'page' : undefined}
    aria-label={label}
    className={`flex-1 h-14 mx-1 rounded-xl ${active ? 'bg-focus text-white' : 'bg-surface text-textSecondary'} active:scale-95 transition-transform`}
    onClick={onClick}
  >
    {label}
  </button>
);

export const BottomTabs: React.FC<BottomTabsProps> = ({ active, onChange }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-md border-t border-gray-800 p-2 z-40">
      <div className="flex">
        <TabButton tab="workout" label="Workout" active={active === 'workout'} onClick={() => onChange('workout')} />
        <TabButton tab="history" label="History" active={active === 'history'} onClick={() => onChange('history')} />
        <TabButton tab="progress" label="Progress" active={active === 'progress'} onClick={() => onChange('progress')} />
        <TabButton tab="settings" label="Settings" active={active === 'settings'} onClick={() => onChange('settings')} />
      </div>
    </nav>
  );
};


