// app/api/admin/brand/route.ts 

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Helper สำหรับ meta debug
const getMeta = () => ({
  runtime: process.env.NEXT_RUNTIME ?? 'unknown',
  db: (() => {
    try {
      const u = new URL(process.env.DATABASE_URL ?? '')
      return { host: `${u.hostname}:${u.port || '5432'}` }
    } catch {
      return null
    }
  })(),
} as const)

// GET: ดึงรายการแบรนด์ (รองรับค้นหา q และจำกัดผลลัพธ์)
export async function GET(req: NextRequest) {
  try {
    // health check เล็ก ๆ ให้แน่ใจว่า connection ใช้งานได้
    await prisma.$queryRaw`select 1 as up`

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const takeParam = Number(searchParams.get('take') || '100')
    const take = Number.isFinite(takeParam) && takeParam > 0 && takeParam <= 500 ? takeParam : 100

    const brands = await prisma.brand.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
      take,
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({ ok: true, data: brands, meta: getMeta() }, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน', meta: getMeta() }, { status: 503 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${error.code})`, meta: getMeta() }, { status: 500 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('GET /api/admin/brand', message)
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 })
  }
}

// POST: สร้างแบรนด์ใหม่
export async function POST(req: Request) {
  try {
    const ct = req.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 })
    }

    type Payload = { name: string }
    const body = (await req.json()) as Partial<Payload>

    const rawName = typeof body.name === 'string' ? body.name : ''
    const name = rawName.trim()
    if (name.length === 0) {
      return NextResponse.json({ ok: false, error: 'ชื่อแบรนด์ไม่ถูกต้อง' }, { status: 400 })
    }

    // ตรวจซ้ำก่อนสร้าง
    const existing = await prisma.brand.findFirst({ where: { name }, select: { id: true } })
    if (existing) {
      return NextResponse.json({ ok: false, error: 'มีแบรนด์นี้อยู่แล้ว' }, { status: 409 })
    }

    const newBrand = await prisma.brand.create({
      data: { name },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({ ok: true, data: newBrand }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 })
      }
      return NextResponse.json({ ok: false, error: `ข้อผิดพลาดฐานข้อมูล (${error.code})` }, { status: 500 })
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ ok: false, error: 'ฐานข้อมูลไม่พร้อมใช้งาน' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : String(error)
    console.error('POST /api/admin/brand', message)
    return NextResponse.json({ ok: false, error: message, meta: getMeta() }, { status: 500 })
  }
}
