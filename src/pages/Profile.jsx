import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/ToastContext';

export default function Profile() {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [credentials, setCredentials] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setCredentials(userProfile.credentials || '');
    }
  }, [userProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user || !updateProfile) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        credentials: credentials.trim() || null,
      });
      showToast('Profile saved successfully.', 'success');
    } catch (err) {
      console.error('Profile save error:', err);
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-700">My Profile</h1>
          <p className="text-gray-600 mt-2">Review or update your reviewer/admin display information.</p>
        </div>
        <Link to="/admin" className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-2xl hover:bg-gray-200">
          Back to dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700">{user?.email || 'Unknown'}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-gray-700 capitalize">{userProfile?.role || 'user'}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 p-4 focus:border-amber-500 focus:ring-amber-100 focus:ring-4"
              placeholder="Enter your full name"
              required
            />
            <p className="text-xs text-gray-500 mt-2">This is the display name shown in remedy review and publish metadata.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Credentials</label>
            <input
              type="text"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 p-4 focus:border-amber-500 focus:ring-amber-100 focus:ring-4"
              placeholder="MBBS, MD, Ayurveda practitioner"
            />
            <p className="text-xs text-gray-500 mt-2">Shown beside your name on reviewed remedies.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-6 py-3 text-white font-semibold hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
