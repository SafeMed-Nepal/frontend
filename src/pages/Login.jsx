import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../lib/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Auto redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }

      showToast('Signed in successfully.', 'success');
      
      // Small delay to let auth state update
      setTimeout(() => {
        navigate('/admin');
      }, 800);
      
    } catch (err) {
      console.error(err);
      const message = err.message || 'Invalid email or password';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-2 text-amber-600">SafeMed Nepal</h1>
        <h2 className="text-xl text-center mb-8 text-gray-600">Admin / Reviewer Login</h2>

        {error && (
          <p className="text-red-600 text-center mb-4 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-amber-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-amber-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-semibold disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/forgot-password" className="text-amber-600 hover:underline">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
