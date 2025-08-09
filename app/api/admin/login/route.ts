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
    const ct = req.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const body = (await req.json()) as { email?: string; password?: string };
    const emailStr = typeof body.email === 'string' ? body.email.trim() : '';
    const passwordStr = typeof body.password === 'string' ? body.password : '';
    if (!emailStr || !passwordStr) {
      return NextResponse.json({ ok: false, error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: emailStr },
      select: { id: true, email: true, password: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const isPasswordValid = await compare(passwordStr, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Login] Missing JWT_SECRET in env');
      return NextResponse.json({ ok: false, error: 'การตั้งค่าเซิร์ฟเวอร์ไม่ถูกต้อง (JWT)' }, { status: 500 });
    }

    const token = sign({ id: admin.id, email: admin.email, role: admin.role }, secret, { expiresIn: '7d' });

    const cookie = serialize('admin-token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return new NextResponse(
      JSON.stringify({ ok: true, user: { id: admin.id, email: admin.email, role: admin.role } }),
      { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const { Prisma } = await import('@prisma/client');

    if (err instanceof Prisma.PrismaClientInitializationError) {
      console.error('[Login] Prisma initialization error:', err.message);
      return NextResponse.json({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน (init)' }, { status: 503 });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P1001') {
        console.error('[Login] Prisma known error P1001:', err.message);
        return NextResponse.json({ ok: false, error: 'เชื่อมต่อฐานข้อมูลไม่ได้ (P1001)' }, { status: 503 });
      }
      console.error('[Login] Prisma known error:', err.code, err.message);
      return NextResponse.json({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${err.code})` }, { status: 500 });
    }

    if (err instanceof Error) {
      console.error('[Login] Unexpected error:', err.message);
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }

    console.error('[Login] Unknown error');
    return NextResponse.json({ ok: false, error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 });
  }
}
