

// app/api/_debug/introspect/customer/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // ตรวจว่าตาราง Customer มีอยู่ไหม (ลองทั้งตัวพิมพ์ใหญ่/เล็ก)
    const reg = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT (to_regclass('public."Customer"') IS NOT NULL OR to_regclass('public.customer') IS NOT NULL) AS exists;
    `

    const cols = await prisma.$queryRaw<{
      table_name: string
      column_name: string
      data_type: string
      is_nullable: 'YES' | 'NO'
    }[]>`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('Customer','customer')
      ORDER BY table_name, ordinal_position;
    `

    return NextResponse.json({ ok: true, tableExists: reg?.[0]?.exists ?? false, columns: cols })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
