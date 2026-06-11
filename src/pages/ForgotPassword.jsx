import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../lib/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetErr) {
      const message = resetErr.message || 'Failed to send reset email.';
      setError(message);
      showToast(message, 'error');
    } else {
      const message = 'If the email exists, a password reset link was sent.';
      setStatus(message);
      showToast(message, 'success');
      setEmail('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2 text-amber-600">Forgot Password</h1>
        <p className="text-center text-gray-600 mb-6">Enter your email to receive a verification link.</p>

        {status && <p className="text-green-600 text-center mb-4 bg-green-50 p-3 rounded-xl">{status}</p>}
        {error && <p className="text-red-600 text-center mb-4 bg-red-50 p-3 rounded-xl">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-amber-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="text-amber-600 hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
