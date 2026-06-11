import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);

    const { error: updateErr } = await supabase.auth.updateUser({ password });

    if (updateErr) {
      const message = updateErr.message || 'Failed to reset password.';
      setError(message);
      showToast(message, 'error');
    } else {
      const message = 'Your password was updated successfully.';
      setStatus(message);
      showToast(message, 'success');
      setTimeout(() => navigate('/login'), 1400);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2 text-amber-600">Reset Password</h1>
        <p className="text-center text-gray-600 mb-6">Set a new password after verification via email.</p>

        {status && <p className="text-green-600 text-center mb-4 bg-green-50 p-3 rounded-xl">{status}</p>}
        {error && <p className="text-red-600 text-center mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-amber-500"
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save new password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="text-amber-600 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
