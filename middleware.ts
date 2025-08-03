

// ✅ สร้าง middleware.ts ที่ root ของโปรเจกต์ (เช่น /middleware.ts)

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('✅ middleware session:', session);

  return res;
}

export const config = {
  matcher: [
    // ใช้กับทุก route ยกเว้น static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
