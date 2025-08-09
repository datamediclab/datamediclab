// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const { email, password, name, role } = (await req.json()) as {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    };

    if (!email || !password || !name) {
      return NextResponse.json({ ok: false, error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' }, { status: 400 });
    }

    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ ok: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: (role ?? 'ADMIN') as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, data: admin }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างแอดมิน';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
