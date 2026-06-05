import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import OfflineBanner from './OfflineBanner';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <>
      <OfflineBanner />
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="text-2xl font-bold text-amber-600">
              SafeMed Nepal
            </Link>
            <LanguageSwitcher />
          </div>

          {user ? (
            <div className="flex flex-wrap items-center gap-3 justify-end">
              <Link
                to="/admin"
                className="text-sm px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
              >
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </>
  );
}