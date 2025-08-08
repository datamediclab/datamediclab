'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAdminStore } from '@/app/store/useAdminStore';

const AdminLoginPage = () => {
  const { setAdmin } = useAdminStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();
      console.log('✅ Login API result:', result);

      if (!res.ok || !result.user) {
        setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
        setLoading(false);
        return;
      }

      setAdmin({
        id: result.user.id,
        email: result.user.email,
        isSuperAdmin: result.user.isSuperAdmin
      });

      window.location.href = '/admin';
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }

    setLoading(false);
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
          <h1 className="text-3xl font-bold text-blue-900">
            เข้าสู่ระบบผู้ดูแลระบบ
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-800">อีเมล</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-800">รหัสผ่าน</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">❌ {error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLoginPage;
