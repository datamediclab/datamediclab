// app/api/admin/login/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // เข้มงวด Content-Type
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const { email, password } = (await req.json()) as { email?: string; password?: string };

    const emailStr = typeof email === 'string' ? email.trim() : '';
    const passwordStr = typeof password === 'string' ? password : '';
    if (emailStr.length === 0 || passwordStr.length === 0) {
      return NextResponse.json({ ok: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: emailStr },
      select: { id: true, email: true, password: true, role: true },
    });

    // เพื่อลดการเดาอีเมล ตอบข้อความรวมกรณีไม่พบหรือรหัสผ่านไม่ถูกต้อง
    if (!admin) {
      return NextResponse.json({ ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isPasswordValid = await compare(passwordStr, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json({ ok: false, error: 'การตั้งค่าเซิร์ฟเวอร์ไม่ถูกต้อง' }, { status: 500 });
    }

    const token = sign(
      { id: admin.id, email: admin.email, role: admin.role },
      secret,
      { expiresIn: '7d' }
    );

    const cookie = serialize('admin-token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return new NextResponse(
      JSON.stringify({
        ok: true,
        user: { id: admin.id, email: admin.email, role: admin.role },
      }),
      { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    console.error('Login API Error:', err);
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดภายในระบบ';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
