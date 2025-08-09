
// app/api/register-device/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { StatusEnum, DeviceType as DeviceTypeEnum } from '@prisma/client'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---- Types (no `any`) ------------------------------------------------------
interface CustomerData {
  fullName: string
  phone: string
  email?: string
}
interface SelectedCustomer { id: number }
interface DeviceData {
  deviceType: DeviceTypeEnum
  capacity: string
  brandId: number
  modelId?: number
  serialNumber?: string
  description?: string
  receivedAt?: string // ISO (optional)
  currentStatus?: StatusEnum // default → WAITING_FOR_CUSTOMER_DEVICE
}
interface RegisterDevicePayload {
  isNewCustomer: boolean
  customerData?: CustomerData
  selectedCustomer?: SelectedCustomer
  deviceData: DeviceData
}

// Small helpers --------------------------------------------------------------
const isNonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const toInt = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseInt(v, 10) : typeof v === 'number' ? v : NaN
  return Number.isFinite(n) ? n : null
}

// GET: list devices (optionally by ?customerId=) -----------------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerIdParam = searchParams.get('customerId')
    const customerId = customerIdParam ? toInt(customerIdParam) : null

    const where = customerId ? { customerId } : undefined

    const rows = await prisma.device.findMany({
      where: where as { customerId?: number },
      orderBy: { id: 'desc' },
      take: 50,
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('GET /api/register-device error:', error)
    const message = error instanceof Error ? error.message : 'ไม่สามารถโหลดรายการได้'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: create a new device --------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown

    // Basic runtime validation
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 })
    }

    const payload = body as RegisterDevicePayload
    const { isNewCustomer, customerData, selectedCustomer, deviceData } = payload

    if (!deviceData) {
      return NextResponse.json({ error: 'missing deviceData' }, { status: 400 })
    }

    if (!isNonEmpty(deviceData.deviceType)) {
      return NextResponse.json({ error: 'กรุณาระบุชนิดอุปกรณ์ (deviceType)' }, { status: 400 })
    }
    if (!isNonEmpty(deviceData.capacity)) {
      return NextResponse.json({ error: 'กรุณาระบุความจุ (capacity)' }, { status: 400 })
    }
    if (typeof deviceData.brandId !== 'number') {
      return NextResponse.json({ error: 'brandId ต้องเป็นตัวเลข' }, { status: 400 })
    }
    if (deviceData.modelId !== undefined && typeof deviceData.modelId !== 'number') {
      return NextResponse.json({ error: 'modelId ต้องเป็นตัวเลขหรือไม่ระบุ' }, { status: 400 })
    }

    let customerId: number | null = null

    if (isNewCustomer) {
      if (!customerData || !isNonEmpty(customerData.fullName) || !isNonEmpty(customerData.phone)) {
        return NextResponse.json({ error: 'ข้อมูลลูกค้าใหม่ไม่ครบถ้วน' }, { status: 400 })
      }
      // สร้างลูกค้า (หรือ upsert จากเบอร์โทรได้ถ้าต้องการ)
      const customer = await prisma.customer.create({
        data: {
          fullName: customerData.fullName.trim(),
          phone: customerData.phone.trim(),
          email: customerData.email?.trim() || null,
        },
      })
      customerId = customer.id
    } else {
      const id = selectedCustomer?.id
      if (!id || !Number.isFinite(id)) {
        return NextResponse.json({ error: 'กรุณาเลือกลูกค้าที่มีอยู่ หรือระบุ selectedCustomer.id' }, { status: 400 })
      }
      const exists = await prisma.customer.findUnique({ where: { id } })
      if (!exists) {
        return NextResponse.json({ error: 'ไม่พบบัญชีลูกค้าที่เลือก' }, { status: 404 })
      }
      customerId = id
    }

    const created = await prisma.device.create({
      data: {
        customerId: customerId!,
        deviceType: deviceData.deviceType,
        capacity: deviceData.capacity.trim(),
        brandId: deviceData.brandId,
        modelId: deviceData.modelId ?? null,
        serialNumber: deviceData.serialNumber ?? null,
        description: deviceData.description ?? null,
        currentStatus: deviceData.currentStatus ?? 'WAITING_FOR_CUSTOMER_DEVICE',
        receivedAt: deviceData.receivedAt ? new Date(deviceData.receivedAt) : undefined,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('POST /api/register-device error:', error)
    const message = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
