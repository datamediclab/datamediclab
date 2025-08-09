// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { UserRole } from '@prisma/client';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CreateAdminPayload {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

// ใช้ตรวจแบบง่ายเพื่อหลีกเลี่ยง regex escape ปัญหาในตัวแก้ไข
const isValidEmail = (e: string) => e.includes('@') && e.includes('.');

export async function POST(req: Request) {
  try {
    // เข้มงวด Content-Type
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 });
    }

    const raw = (await req.json()) as Partial<CreateAdminPayload>;
    const email = (raw.email ?? '').trim().toLowerCase();
    const password = raw.password ?? '';
    const name = (raw.name ?? '').trim();
    const role: UserRole = raw.role ?? 'ADMIN';

    if (!email || !password || !name) {
      return NextResponse.json(
        { ok: false, error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (name, email, password)' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: 'อีเมลไม่ถูกต้อง' }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: { email, name, password: passwordHash, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, data: admin }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { ok: false, error: 'อีเมลนี้ถูกใช้งานในฐานข้อมูลของเราแล้ว' },
        { status: 409 }
      );
    }

    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างแอดมิน';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

