// middleware.ts
import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'], // ⬅️ สำคัญมาก
};
