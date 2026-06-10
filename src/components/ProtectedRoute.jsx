import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, userProfile, loading } = useAuth();

  // Debugging help: if ProtectedRoute is blocking, we want visible info.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-gray-100 bg-white px-8 py-6 shadow-sm">
          <div className="font-medium text-gray-900">Loading secure area...</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-amber-500" />
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
        <div className="max-w-sm rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <ShieldAlert className="mx-auto mb-3 h-9 w-9 text-red-600" aria-hidden />
          <div className="font-semibold text-gray-900">Access denied</div>
          <div className="mt-2 text-sm text-gray-600">This area is available only to reviewers and admins.</div>
        </div>
      </div>
    );
  }

  return children;
}
