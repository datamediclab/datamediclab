// lib/validateAdmin.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export const validateAdmin = async (email: string, password: string) => {
  const supabase = createRouteHandlerClient({ cookies });

  console.log('[validateAdmin] Checking admin for email:', email);

  const { data: admin, error } = await supabase
    .from('Admin')
    .select('id, email, passwordHash, role')
    .eq('email', email)
    .single();

  if (error) {
    console.error('[validateAdmin] Supabase error:', error);
  }
  console.log('[validateAdmin] Supabase admin result:', admin);

  if (error || !admin) {
    return { success: false, message: 'ไม่พบบัญชีผู้ดูแลระบบ' };
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  console.log('[validateAdmin] Password match:', isMatch);

  if (!isMatch) {
    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' };
  }

  return {
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    },
  };
};
