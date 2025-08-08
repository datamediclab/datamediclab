// middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
return NextResponse.next(); // ⬅️ ปิด Middleware ชั่วคราว
}

export const config = {
matcher: ['/admin/:path*'],
};