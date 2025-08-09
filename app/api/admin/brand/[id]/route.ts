// app/api/admin/brand/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- Error code type guards (ไม่ใช้ any) ----
type ErrorWithCode = { code: unknown }
const hasCode = (e: unknown): e is ErrorWithCode => typeof e === 'object' && e !== null && 'code' in e
const isP2025 = (e: unknown): e is { code: 'P2025' } => hasCode(e) && (e as ErrorWithCode).code === 'P2025'
const isP2002 = (e: unknown): e is { code: 'P2002' } => hasCode(e) && (e as ErrorWithCode).code === 'P2002' // unique constraint
const isP2003 = (e: unknown): e is { code: 'P2003' } => hasCode(e) && (e as ErrorWithCode).code === 'P2003' // fk violation

// ✅ รองรับ Next.js ที่ params เป็น Promise
interface BrandContext { params: Promise<{ id: string }> }

// ---- GET: อ่านแบรนด์ตาม id ----
export async function GET(_req: NextRequest, context: BrandContext) {
  try {
    const { id: idStr } = await context.params
    const id = Number(idStr)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const brand = await prisma.brand.findUnique({ where: { id } })
    if (!brand) {
      return NextResponse.json({ ok: false, error: 'ไม่พบข้อมูลแบรนด์' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: brand })
  } catch (error: unknown) {
    console.error('❌ GET /api/admin/brand/[id] error:', error)
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// ---- PUT: แก้ไขชื่อแบรนด์ ----
export async function PUT(req: NextRequest, context: BrandContext) {
  try {
    // เช็ค Content-Type เข้มขึ้น
    if (!req.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({ ok: false, error: 'Unsupported Content-Type' }, { status: 415 })
    }

    const { id: idStr } = await context.params
    const id = Number(idStr)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const body = await req.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ ok: false, error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 })
    }

    const rawName = (body as { name?: string }).name
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    if (name.length === 0) {
      return NextResponse.json({ ok: false, error: 'กรุณาระบุ name' }, { status: 400 })
    }

    // ตรวจว่ามีแบรนด์นี้จริงก่อน
    const brandExists = await prisma.brand.findUnique({ where: { id } })
    if (!brandExists) {
      return NextResponse.json({ ok: false, error: `ไม่พบแบรนด์ที่มี ID: ${id}` }, { status: 404 })
    }

    // ป้องกันชื่อซ้ำกับแบรนด์อื่น
    const dup = await prisma.brand.findFirst({ where: { name, NOT: { id } } })
    if (dup) {
      return NextResponse.json({ ok: false, error: 'มีชื่อแบรนด์นี้อยู่แล้ว' }, { status: 409 })
    }

    const updatedBrand = await prisma.brand.update({ where: { id }, data: { name } })
    return NextResponse.json({ ok: true, data: updatedBrand }, { status: 200 })
  } catch (error: unknown) {
    console.error('❌ PUT /api/admin/brand/[id] error:', error)
    if (isP2025(error)) {
      return NextResponse.json({ ok: false, error: 'ไม่พบข้อมูลแบรนด์ที่ต้องการแก้ไข' }, { status: 404 })
    }
    if (isP2002(error)) {
      return NextResponse.json({ ok: false, error: 'ข้อมูลซ้ำ (unique)' }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// ---- DELETE: ลบแบรนด์ตาม id ----
export async function DELETE(_req: NextRequest, context: BrandContext) {
  try {
    const { id: idStr } = await context.params
    const id = Number(idStr)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ ok: false, error: 'ID ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const deleted = await prisma.brand.delete({ where: { id } })
    return NextResponse.json({ ok: true, data: deleted })
  } catch (error: unknown) {
    console.error('❌ DELETE /api/admin/brand/[id] error:', error)

    if (isP2025(error)) {
      return NextResponse.json({ ok: false, error: 'ไม่พบแบรนด์ที่ต้องการลบ' }, { status: 404 })
    }
    if (isP2003(error)) {
      // มีความสัมพันธ์กับตารางอื่น (เช่น brandModel) ทำให้ลบไม่ได้
      return NextResponse.json({ ok: false, error: 'ลบไม่ได้ เนื่องจากมีข้อมูลที่อ้างอิงอยู่' }, { status: 409 })
    }

    return NextResponse.json({ ok: false, error: 'ไม่สามารถลบแบรนด์ได้' }, { status: 500 })
  }
}
