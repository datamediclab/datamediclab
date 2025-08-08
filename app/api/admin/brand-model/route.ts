// app/api/admin/brand-model/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // ✨ แก้ไข: นำเข้า Prisma จากไฟล์กลางให้ถูกต้อง

export const dynamic = 'force-dynamic';

// ✅ GET: ดึงข้อมูลรุ่นของแบรนด์ทั้งหมด
export const GET = async () => {
  try {
    const brandModels = await prisma.brandModel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true, // ✨ เพิ่ม: ดึงข้อมูลแบรนด์ที่เกี่ยวข้องมาด้วย
      },
    });
    return NextResponse.json(brandModels);
  } catch (error) {
    console.error('GET /api/admin/brand-model error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

// ✅ POST: สร้างรุ่นของแบรนด์ใหม่
export const POST = async (req: Request) => {
  try {
    const { name, brandId } = await req.json();

    // 1. ตรวจสอบข้อมูลนำเข้า
    if (!name || !brandId) {
      return NextResponse.json(
        { error: 'กรุณาระบุชื่อรุ่นและ ID ของแบรนด์' },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบว่ามีแบรนด์นี้อยู่จริงหรือไม่
    const brandExists = await prisma.brand.findUnique({
      where: { id: Number(brandId) },
    });

    if (!brandExists) {
      return NextResponse.json(
        { error: `ไม่พบแบรนด์ที่มี ID: ${brandId}` },
        { status: 404 }
      );
    }

    // 3. สร้างข้อมูลรุ่นของแบรนด์ใหม่
    const newBrandModel = await prisma.brandModel.create({
      data: {
        name,
        brandId: Number(brandId),
      },
    });

    return NextResponse.json(newBrandModel, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/brand-model error:', error);
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
    return NextResponse.json({ error: message }, { status: 500 });
  }
};