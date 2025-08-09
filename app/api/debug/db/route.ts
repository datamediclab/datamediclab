// app/api/_debug/db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ColumnInfo = {
  table_name: string
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
}

type ExistsRow = { exists: boolean }

function parseUrl(u?: string | null) {
  if (!u) return null
  try {
    const x = new URL(u)
    return { protocol: x.protocol, host: x.host, path: x.pathname, query: x.search }
  } catch {
    return 'invalid' as const
  }
}

export async function GET() {
  try {
    // ping DB
    const ping = await prisma.$queryRaw`select 1 as up`

    // ตรวจว่าตาราง Customer มีอยู่ไหม (ลองทั้งตัวพิมพ์ใหญ่/เล็ก)
    const reg = await prisma.$queryRaw<ExistsRow[]>`
      SELECT (to_regclass('public."Customer"') IS NOT NULL OR to_regclass('public.customer') IS NOT NULL) AS exists;
    `

    const cols = await prisma.$queryRaw<ColumnInfo[]>`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name IN ('Customer','customer')
      ORDER BY table_name, ordinal_position;
    `

    return NextResponse.json({
      ok: true,
      env: {
        has_DATABASE_URL: Boolean(process.env.DATABASE_URL),
        has_DIRECT_URL: Boolean(process.env.DIRECT_URL),
        database_url_parsed: parseUrl(process.env.DATABASE_URL ?? null),
      },
      ping,
      tableExists: reg?.[0]?.exists ?? false,
      columns: cols,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('GET /api/_debug/db error:', err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
