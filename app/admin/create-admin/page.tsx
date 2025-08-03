// 📄 app/admin/create-admin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreateAdminPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'เกิดข้อผิดพลาด');

      setSuccess(true);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างผู้ดูแล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-4">สร้างผู้ดูแลระบบ</h1>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold text-gray-800">ชื่อ</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
          {success && <p className="text-green-600 text-sm">✅ สร้างผู้ดูแลระบบเรียบร้อยแล้ว</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกผู้ดูแลระบบ'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default CreateAdminPage;
