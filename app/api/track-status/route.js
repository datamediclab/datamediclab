// app/api/track-status/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✨ แก้ไข: เปลี่ยนมาใช้ Prisma

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "กรุณาระบุหมายเลขโทรศัพท์" },
        { status: 400 }
      );
    }

    // ✨ แก้ไข: เปลี่ยนมาใช้ Prisma ในการค้นหาข้อมูล
    // สมมติว่า Model ของคุณใน schema.prisma ชื่อ 'deviceRegistration'
    const registration = await prisma.deviceRegistration.findFirst({
      where: {
        phone: phone,
      },
      orderBy: {
        createdAt: 'desc', // หรือ 'createdAt' ขึ้นอยู่กับชื่อ field ใน schema
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการลงทะเบียนสำหรับหมายเลขโทรศัพท์นี้" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      currentStatus: registration.currentStatus || "ยังไม่มีการอัปเดตสถานะ",
      customerName: registration.customerName, // หรือ 'customer_name'
      deviceModel: registration.deviceModel, // หรือ 'device_model'
      updatedAt: new Date(registration.createdAt).toLocaleString("th-TH", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

  } catch (err) {
    console.error("Unexpected API error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
