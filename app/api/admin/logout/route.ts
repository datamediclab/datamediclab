// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // สร้างคุกกี้ชื่อเดียวกับตอน login และลบทิ้งด้วย maxAge: 0 (หรือ -1 ก็ได้)
    const cookie = serialize('admin-token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // redirect กลับหน้า /admin/login โดยอิงจาก URL ปัจจุบัน (รองรับทุก env)
    const redirectURL = new URL('/admin/login', new URL(req.url).origin);
    const res = NextResponse.redirect(redirectURL, { status: 302 });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ ok: false, error: 'เกิดข้อผิดพลาดในการออกจากระบบ' }, { status: 500 });
  }
}

// (ทางเลือก) รองรับ GET สำหรับการเรียกจากลิงก์ปุ่มออกจากระบบ
export const GET = POST;