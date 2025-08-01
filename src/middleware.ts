// ✅ Middleware เปล่าสำหรับ Next.js
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}
