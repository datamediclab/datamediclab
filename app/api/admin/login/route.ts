// 📄 app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabaseServer';
import { validateAdmin } from '@/lib/validateAdmin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      return NextResponse.json({ message: 'เข้าสู่ระบบไม่สำเร็จ' }, { status: 401 });
    }

    const admin = await validateAdmin(supabase, data.user.id);

    if (!admin) {
      return NextResponse.json({ message: 'ไม่พบสิทธิ์ผู้ดูแลระบบ' }, { status: 403 });
    }

    // ✅ แก้ให้ตั้ง cookie ด้วย NextResponse อย่างถูกต้อง (secure: false สำหรับ localhost)
    const response = NextResponse.json({ admin });
    response.cookies.set('adminId', admin.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // 👈 ปิด secure สำหรับ dev
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    });

    return response;
  } catch (error) {
    console.error('[admin/login] error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
  }
}
