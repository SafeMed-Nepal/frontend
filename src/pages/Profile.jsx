import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/ToastContext';
import { User, Mail, Shield, Award, ArrowLeft, Save, Stethoscope } from 'lucide-react';

export default function Profile() {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [credentials, setCredentials] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setCredentials(userProfile.credentials || '');
      setAvatar(userProfile.avatar_url || '');
    }
  }, [userProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        await updateProfile({
          full_name: fullName.trim(),
          credentials: credentials.trim() || null,
          avatar_url: base64String,
        });
        setAvatar(base64String);
        showToast('Profile picture updated successfully!', 'success');
      } catch (err) {
        console.error('Avatar save error:', err);
        showToast(err.message || 'Failed to save profile picture.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!user || !updateProfile) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        credentials: credentials.trim() || null,
        avatar_url: avatar || null,
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 font-semibold">Loading profile...</div>
        </div>
      </div>
    );
  }

  // Get initials for Avatar
  const getInitials = (name) => {
    if (!name) return 'SM';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isReviewer = userProfile?.role === 'reviewer';
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Back navigation */}
      <div className="mb-6">
        <Link 
          to="/admin" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner with modern gradient and overlay */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
        </div>

        {/* Profile Card Header Content */}
        <div className="relative px-6 sm:px-8 pb-6 border-b border-slate-100 bg-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-md shrink-0 -mt-14 sm:-mt-16 z-10 relative group overflow-hidden">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Profile" 
                  className="w-full h-full rounded-2xl object-cover shadow-inner"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  {getInitials(fullName || user?.email)}
                </div>
              )}
              {/* File upload overlay */}
              <label className="absolute inset-1.5 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer text-center px-1">
                <span>Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Title / Role */}
            <div className="space-y-1.5 py-1 text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {fullName || 'SafeMed Member'}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="text-sm text-slate-500 font-medium">{user?.email}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isAdmin ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  isReviewer ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {isAdmin ? <Shield size={12} /> : isReviewer ? <Stethoscope size={12} /> : <User size={12} />}
                  <span className="capitalize">{userProfile?.role || 'user'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-600" />
            <span>Profile Settings</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email (Read-Only) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email address</span>
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-slate-600 text-sm font-medium">
                  {user?.email || 'Not available'}
                </div>
                <p className="text-xs text-slate-400">Your email address cannot be changed.</p>
              </div>

              {/* Role (Read-Only) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Access Level</span>
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-slate-600 text-sm font-medium capitalize">
                  {userProfile?.role || 'user'}
                </div>
                <p className="text-xs text-slate-400">Assigned by administrators.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6"></div>

            <div className="space-y-6">
              {/* Full name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-slate-800 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="Enter your full name"
                  required
                />
                <p className="text-xs text-slate-400">
                  This name will be displayed publicly on remedies you author or review.
                </p>
              </div>

              {/* Credentials Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Professional Credentials</span>
                </label>
                <input
                  type="text"
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-slate-800 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g., MBBS, MD Cardiology, Ayurveda Specialist"
                />
                <p className="text-xs text-slate-400">
                  Your academic degrees or medical certifications (displayed next to your name).
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
