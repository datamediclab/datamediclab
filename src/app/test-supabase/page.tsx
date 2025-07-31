'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

const TestSupabasePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        setError(error.message);
        setUsers([]);
      } else {
        setUsers(data as User[]);
      }
    };

    fetchUsers();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔗 Supabase Test</h1>
      {error && <p className="text-red-500">❌ Error: {error}</p>}
      {!error && users.length === 0 && <p>⏳ Loading or no users found.</p>}
      {users.length > 0 && (
        <ul className="list-disc pl-6">
          {users.map((user, index) => (
            <li key={index}>
              {JSON.stringify(user)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default TestSupabasePage;
