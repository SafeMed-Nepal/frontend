import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import OfflineBanner from './OfflineBanner';
import NotificationBell from './NotificationBell';
import { useAuth } from '../lib/AuthContext';
import { LayoutDashboard, User, LogOut, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();

  return (
    <>
      <OfflineBanner />
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-amber-600">
              SafeMed Nepal
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/about"
              className="text-sm font-semibold text-slate-600 hover:text-amber-600 px-3 py-2 rounded-xl transition-all"
            >
              About
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <NotificationBell />
                {/* Desktop buttons */}
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex text-sm px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/profile"
                  className="hidden sm:inline-flex items-center gap-2 text-sm px-4 py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 font-medium"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="profile avatar"
                      className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Profile</span>
                </Link>
                <button
                  onClick={signOut}
                  className="hidden sm:inline-flex text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                >
                  Logout
                </button>

                {/* Mobile icon buttons */}
                <Link
                  to="/admin"
                  aria-label="Dashboard"
                  className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                >
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                </Link>
                <Link
                  to="/admin/profile"
                  aria-label="Profile"
                  className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 overflow-hidden"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="profile avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-[18px] h-[18px]" />
                  )}
                </Link>
                <button
                  onClick={signOut}
                  aria-label="Logout"
                  className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-red-600 hover:bg-red-50 border border-red-200"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Staff Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}