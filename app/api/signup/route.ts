// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

interface CreateAdminPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as Partial<CreateAdminPayload>;
    const email = (raw.email ?? '').trim().toLowerCase();
    const password = raw.password ?? '';
    const name = (raw.name ?? '').trim();
    const role: UserRole = raw.role ?? 'ADMIN';

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (name, email, password)' },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: passwordHash,
        role,
      },
    });

    // ส่งกลับเฉพาะฟิลด์ที่มีอยู่จริงใน schema
    const adminSafe = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      createdAt: admin.createdAt,
    };

    return NextResponse.json({ success: true, admin: adminSafe }, { status: 201 });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานในฐานข้อมูลของเราแล้ว' },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างแอดมิน';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
