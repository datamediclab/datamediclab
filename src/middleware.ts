// ✅ Middleware เปล่าสำหรับ Next.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.next();
}
