// app/api/admin/logout/route.ts

import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  try {
    // 1. สร้าง cookie ชื่อ 'admin-token' ให้มีค่าว่าง และตั้งค่าให้หมดอายุทันที (maxAge: -1)
    // การกระทำนี้เป็นการสั่งให้เบราว์เซอร์ของผู้ใช้ลบ cookie ดังกล่าวทิ้ง
    const cookie = serialize('admin-token', '', {
      httpOnly: true, // ป้องกันการเข้าถึง cookie ผ่าน JavaScript ฝั่ง Client
      path: '/',      // กำหนดให้ cookie นี้มีผลทั้งเว็บไซต์
      maxAge: -1,     // ตั้งค่าให้ cookie หมดอายุทันที
    });

    // 2. สร้าง Response เพื่อ redirect ผู้ใช้กลับไปยังหน้า login
    // ใช้ค่าจาก environment variable หรือ fallback เป็น localhost
    const redirectURL = new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const res = NextResponse.redirect(redirectURL);

    // 3. ตั้งค่า header 'Set-Cookie' ใน Response ที่จะส่งกลับไป
    // เพื่อส่งคำสั่งลบ cookie ไปยังเบราว์เซอร์
    res.headers.set('Set-Cookie', cookie);

    return res;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' }, { status: 500 });
  }
}
