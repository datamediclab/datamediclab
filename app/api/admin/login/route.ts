// app/api/admin/login/route.ts
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ success: false, error: 'ไม่พบบัญชีผู้ดูแล' }, { status: 401 });
    }

    const isPasswordValid = await compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    // ปรับให้ตรงกับฟิลด์ที่มีอยู่จริงใน Prisma schema (ลบ is_super_admin ถ้าไม่มี)
    const token = sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'ADMIN'
      },
      process.env.JWT_SECRET as string,
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
        success: true,
        user: {
          id: admin.id,
          email: admin.email
        }
      }),
      {
        status: 200,
        headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' }
      }
    );
  } catch (err: unknown) {
    console.error('Login API Error:', err);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 });
  }
}
