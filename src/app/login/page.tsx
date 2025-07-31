// 📄 src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }

    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setError(error.message);
  };

  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">🔐 Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="w-full p-2 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">❌ {error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="mb-2">or continue with</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => handleOAuth('google')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            GitHub
          </button>
          <button
            onClick={() => handleOAuth('facebook')}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Facebook
          </button>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
