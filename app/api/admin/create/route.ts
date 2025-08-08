

// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✅ ใช้ Prisma จากไฟล์กลาง ตามที่กำหนด
import bcrypt from 'bcryptjs';
import type { UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = (await req.json()) as {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบอีเมลซ้ำ
    const exists = await prisma.admin.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    // แฮชรหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword, // เปลี่ยนชื่อคีย์เป็น passwordHash หาก schema ใช้ชื่อนั้น
        role: (role ?? 'ADMIN') as UserRole,
      },
      // เลือกเฉพาะฟิลด์ที่ model มีจริง เพื่อเลี่ยง TS error
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        // updatedAt: true, // ❌ ตัดออกเพราะไม่มีใน AdminSelect ของ schema ปัจจุบัน
      },
    });

    return NextResponse.json({ success: true, admin }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างแอดมิน';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
