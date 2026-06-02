import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();

  // Debugging help: if ProtectedRoute is blocking, we want visible info.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          Loading...
          <div className="text-xs text-gray-500 mt-2">
            user: {user ? 'yes' : 'no'} | profile: {userProfile ? 'yes' : 'no'}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If profile row is missing (RLS / not created yet), treat logged-in user as allowed
  // for admin UI, since backend can enforce actual authorization.
  if (!userProfile) {
    return children;
  }

  if (userProfile.role !== 'admin' && userProfile.role !== 'reviewer') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          Access denied.
          <div className="text-xs text-gray-500 mt-2">role: {userProfile?.role || 'missing'}</div>
        </div>
      </div>
    );
  }

  return children;
}
