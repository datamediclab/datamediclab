// app/api/admin/create/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient, UserRole } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body as {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    };

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const userRole = role ?? 'ADMIN';

    // 1. Create user in Supabase Auth
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !user?.user) {
      console.error('❌ Supabase user creation failed:', error?.message);
      return NextResponse.json(
        { error: 'ไม่สามารถสร้างผู้ใช้งานในระบบได้' },
        { status: 500 }
      );
    }

    // 2. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create record in Prisma (Admin table)
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: userRole,
      },
    });

    return NextResponse.json({ success: true, admin }, { status: 201 });
  } catch (err) {
    console.error('❌ Unexpected error:', (err as Error).message);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการสร้างแอดมิน' },
      { status: 500 }
    );
  }
}
