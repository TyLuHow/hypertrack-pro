import React, { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export const InstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault();
      setInstallPromptEvent(evt);
      setTimeout(() => setShowPrompt(true), 60000);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      await installPromptEvent.userChoice;
      setShowPrompt(false);
    }
  };

  if (!showPrompt || !installPromptEvent) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-slate-800 border border-slate-600 rounded-2xl p-6 shadow-2xl z-40">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Install HyperTrack Pro</h3>
          <p className="text-gray-300 text-sm mb-4">Get the full app experience with offline support and faster loading.</p>
          <div className="flex gap-3">
            <button onClick={handleInstall} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Install App</button>
            <button onClick={() => setShowPrompt(false)} className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Not Now</button>
          </div>
        </div>
        <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-gray-300 p-1">✕</button>
      </div>
    </div>
  );
};


