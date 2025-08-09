// app/api/register-device/history/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Shape that the UI table expects
export type HistoryItem = {
  id: string
  deviceType: string | null
  brandName: string | null
  modelName: string | null
  serialNumber: string | null
  problem: string | null
  status: string | null
  createdAt: string // ISO
}

// ---------- helpers (no-any, safe parsing) ----------
function toInt(v: string | null): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function toPositiveInt(v: string | null, fallback: number, max = 100): number {
  const n = toInt(v)
  const safe = n && n > 0 ? n : fallback
  return Math.min(safe, max)
}

// ---------- handlers ----------
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const customerId = toInt(url.searchParams.get('customerId'))
  const limit = toPositiveInt(url.searchParams.get('limit'), 20)

  if (customerId == null) return NextResponse.json<HistoryItem[]>([], { status: 200 })

  try {
    const items = await fetchHistory(customerId, limit)
    return NextResponse.json<HistoryItem[]>(items, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'history query failed'
    console.error('/api/register-device/history GET error:', msg)
    return NextResponse.json<HistoryItem[]>([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json<HistoryItem[]>([], { status: 200 })
  }

  let body: unknown = null
  try {
    body = await req.json()
  } catch {
    // ignore; treated as null
  }

  const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
  const rawId = isObj(body) ? (body.customerId as unknown) : null
  const rawLimit = isObj(body) ? (body.limit as unknown) : null

  const customerId = typeof rawId === 'string' || typeof rawId === 'number' ? toInt(String(rawId)) : null
  const limit = typeof rawLimit === 'string' || typeof rawLimit === 'number' ? toPositiveInt(String(rawLimit), 20) : 20

  if (customerId == null) return NextResponse.json<HistoryItem[]>([], { status: 200 })

  try {
    const items = await fetchHistory(customerId, limit)
    return NextResponse.json<HistoryItem[]>(items, { status: 200 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'history query failed'
    console.error('/api/register-device/history POST error:', msg)
    return NextResponse.json<HistoryItem[]>([], { status: 200 })
  }
}

// ---------- core query ----------
async function fetchHistory(customerId: number, limit: number): Promise<HistoryItem[]> {
  const rows = await prisma.device.findMany({
    where: { customerId },
    orderBy: { receivedAt: 'desc' },
    take: Math.max(1, Math.min(limit, 100)),
    select: {
      id: true,
      deviceType: true,
      serialNumber: true,
      description: true,
      currentStatus: true,
      receivedAt: true,
      brand: { select: { name: true } }, // requires relation in schema
      model: { select: { name: true } }, // requires relation in schema
    },
  })

  // Debug log (safe): count only
  console.log('history rows:', rows.length, 'customerId:', customerId)

  return rows.map((r) => ({
    id: String(r.id),
    deviceType: r.deviceType ? String(r.deviceType) : null,
    brandName: r.brand?.name ?? null,
    modelName: r.model?.name ?? null,
    serialNumber: r.serialNumber ?? null,
    problem: r.description ?? null,
    status: r.currentStatus ? String(r.currentStatus) : null,
    createdAt: r.receivedAt ? new Date(r.receivedAt).toISOString() : new Date(0).toISOString(),
  }))
}
