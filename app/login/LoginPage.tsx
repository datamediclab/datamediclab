'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

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
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Data Medic Lab Logo"
            width={80}
            height={80}
            className="mx-auto mb-2"
          />
          <h1 className="text-3xl font-bold text-blue-800">เข้าสู่ระบบ</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">อีเมล</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">รหัสผ่าน</label>
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
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="mb-2 text-sm text-gray-600">หรือเข้าสู่ระบบด้วยบัญชีอื่น</p>
          <div className="flex gap-3 justify-center">
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
      </div>
    </main>
  );
};

export default LoginPage;
