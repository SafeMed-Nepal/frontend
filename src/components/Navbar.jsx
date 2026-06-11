import { useState } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import OfflineBanner from './OfflineBanner';
import NotificationBell from './NotificationBell';
import { useAuth } from '../lib/AuthContext';
import { LayoutDashboard, User, LogOut, LogIn, Menu, X, Info } from 'lucide-react';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <OfflineBanner />
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left branding */}
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-amber-600">
              SafeMed Nepal
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-amber-600 px-3 py-2 rounded-xl transition-all"
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </Link>

              {user ? (
                <>
                  <NotificationBell />
                  <Link
                    to="/admin"
                    className="text-sm px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/profile"
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 font-medium transition"
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
                    className="text-sm px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition"
                  >
                    Logout
                  </button>
                </>
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

            {/* Mobile Controls (Notification Bell always visible if logged in) */}
            {user && (
              <div className="sm:hidden flex items-center">
                <NotificationBell />
              </div>
            )}

            {/* Hamburger Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-slate-50 transition"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1 shadow-inner">
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 py-2 transition"
            >
              <Info className="w-[18px] h-[18px]" />
              <span>About</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 py-2 transition"
                >
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600 py-2 transition"
                >
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="profile avatar"
                      className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <User className="w-[18px] h-[18px]" />
                  )}
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl px-3 py-2 w-full text-left transition"
                >
                  <LogOut className="w-[18px] h-[18px]" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition w-full"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Staff Login</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}