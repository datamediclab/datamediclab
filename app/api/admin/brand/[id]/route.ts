// app/api/admin/brand/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ใช้ client กลางแบบเดียวเท่านั้น
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Type guard for Prisma error code without importing Prisma types
// (No `any`, complies with ESLint rule)
type ErrorWithCode = { code: unknown }
const isP2025 = (e: unknown): e is { code: 'P2025' } => {
  if (typeof e !== 'object' || e === null) return false
  if (!('code' in e)) return false
  const code = (e as ErrorWithCode).code
  return code === 'P2025'
}


// ✅ type สำหรับ context (รองรับ Next.js ที่ params เป็น Promise)
interface BrandContext {
  params: Promise<{ id: string }>
}

// ✅ GET: ดึงข้อมูลแบรนด์ตาม id
export async function GET(req: NextRequest, context: BrandContext) {
  try {
    const params = await context.params
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const brand = await prisma.brand.findUnique({ where: { id } })
    if (!brand) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลแบรนด์' }, { status: 404 })
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('❌ GET Brand Error:', error)
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ✅ PUT: แก้ไขข้อมูลแบรนด์
export async function PUT(req: NextRequest, context: BrandContext) {
  try {
    const params = await context.params
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const body = await req.json()
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' }, { status: 400 })
    }

    const { name } = body
    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุ name' }, { status: 400 })
    }

    const brandExists = await prisma.brand.findUnique({ where: { id } })
    if (!brandExists) {
      return NextResponse.json({ error: `ไม่พบแบรนด์ที่มี ID: ${id}` }, { status: 404 })
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(updatedBrand)
  } catch (error: unknown) {
    console.error('❌ PUT Brand Error:', error)
    if (isP2025(error)) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลแบรนด์ที่ต้องการแก้ไข' },
        { status: 404 }
      )
    }
    const message = error instanceof Error ? error.message : 'ไม่สามารถแก้ไขข้อมูลได้'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ✅ DELETE: ลบแบรนด์ตาม id
export async function DELETE(req: NextRequest, context: BrandContext) {
  try {
    const params = await context.params
    const id = parseInt(params.id, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'id ต้องเป็นตัวเลข' }, { status: 400 })
    }

    const deleted = await prisma.brand.delete({ where: { id } })
    return NextResponse.json({ success: true, deleted })
  } catch (err: unknown) {
    console.error('❌ DELETE Brand Error:', err)

    if (isP2025(err)) {
      return NextResponse.json(
        { error: `ไม่พบแบรนด์ที่ต้องการลบ (ID: ${(await context.params).id})` },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: 'ไม่สามารถลบแบรนด์ได้' }, { status: 500 })
  }
}
