import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import OfflineBanner from './OfflineBanner';
import { useEffect, useState } from 'react';
import { getQueueLength } from '../lib/offlineReviews';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    let mounted = true;
    const update = async () => {
      if (!mounted) return;
      try { setQueued(await getQueueLength()); } catch (e) { }
    }
    update();
    const onQueued = () => update();
    const onFlushed = () => update();
    window.addEventListener('offlineReviews:queued', onQueued);
    window.addEventListener('offlineReviews:flushed', onFlushed);
    return () => { mounted = false; window.removeEventListener('offlineReviews:queued', onQueued); window.removeEventListener('offlineReviews:flushed', onFlushed); };
  }, []);

  return (
    <>
      <OfflineBanner />
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-amber-600">
            SafeMed Nepal
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user && (
              <>
                <div className="text-sm text-gray-700 px-2">Queued: {queued}</div>
                <button
                  onClick={signOut}
                  className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}