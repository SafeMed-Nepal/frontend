import { useEffect, useState } from 'react';
import { getQueueLength } from '../lib/offlineReviews';
import { CloudOff } from 'lucide-react';

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const onOnline = () => { setOnline(true); setQueued(getQueueLength()); };
    const onOffline = () => setOnline(false);
    const onQueued = async (e) => setQueued(await getQueueLength());
    const onFlushed = async (e) => setQueued(await getQueueLength());

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('offlineReviews:queued', onQueued);
    window.addEventListener('offlineReviews:flushed', onFlushed);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('offlineReviews:queued', onQueued);
      window.removeEventListener('offlineReviews:flushed', onFlushed);
    };
  }, []);

  if (online && queued === 0) return null;

  return (
    <div className={`w-full text-sm text-white ${online ? 'bg-amber-600' : 'bg-red-600'} p-2 text-center`}>
      {!online ? (
        <div className="flex items-center justify-center gap-2">
          <CloudOff className="w-4 h-4" /> Offline — your reviews will be queued
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <span>{queued}</span> review(s) pending sync
        </div>
      )}
    </div>
  );
}
