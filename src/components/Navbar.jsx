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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-amber-600">
            SafeMed Nepal
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user && (
              <button
                onClick={signOut}
                className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}