import { useEffect, useState } from 'react';
import { OfflineDatabase } from '../../lib/offline/database';

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [db] = useState(() => new OfflineDatabase());

  useEffect(() => {
    db.initialize();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [db]);

  const runSync = async () => {
    setSyncing(true);
    try {
      await db.drainQueue(async () => {
        // TODO: push queued items to Supabase here
      });
    } finally {
      setSyncing(false);
    }
  };

  return { online, syncing, runSync, db };
}



