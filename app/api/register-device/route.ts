// app/api/register-device/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeviceType, StatusEnum } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---- helpers (no-any, safe guards) ----
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function toInt(v: unknown): number | null {
  if (typeof v === 'number' && Number.isInteger(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function isEnumValue<T extends string>(value: unknown, enumObj: Record<string, T>): value is T {
  return typeof value === 'string' && (Object.values(enumObj) as string[]).includes(value.toUpperCase());
}

function trimOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

// Optional: parse ISO date, return null if invalid
function parseIsoDate(v: unknown): Date | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---- POST: Register a device (create customer if needed) ----
export async function POST(req: Request) {
  // Strict content-type
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง (อ่าน JSON ไม่ได้)' }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'payload ต้องเป็น object' }, { status: 400 });
  }

  const isNewCustomer = body.isNewCustomer === true;
  const customerData = isRecord(body.customerData) ? body.customerData : undefined;
  const selectedCustomer = isRecord(body.selectedCustomer) ? body.selectedCustomer : undefined;
  const deviceData = isRecord(body.deviceData) ? body.deviceData : undefined;

  if (!deviceData) {
    return NextResponse.json({ error: 'deviceData จำเป็นต้องมี' }, { status: 400 });
  }

  // ---- device fields ----
  const brandId = toInt(deviceData.brandId);
  const modelId = toInt(deviceData.modelId);
  const deviceTypeRaw = typeof deviceData.deviceType === 'string' ? deviceData.deviceType.toUpperCase() : deviceData.deviceType;
  const serialNumber = trimOrEmpty(deviceData.serialNumber) || undefined;
  const capacity = trimOrEmpty(deviceData.capacity);
  const description = trimOrEmpty(deviceData.description);
  const currentStatusRaw = typeof deviceData.currentStatus === 'string' ? deviceData.currentStatus.toUpperCase() : deviceData.currentStatus;
  const receivedAt = parseIsoDate(deviceData.receivedAt) ?? new Date();

  if (brandId == null) {
    return NextResponse.json({ error: 'brandId ไม่ถูกต้อง' }, { status: 400 });
  }

  if (capacity.length === 0) {
    return NextResponse.json({ error: 'กรุณาระบุความจุ (capacity)' }, { status: 400 });
  }

  if (!isEnumValue(deviceTypeRaw, DeviceType)) {
    return NextResponse.json({ error: 'deviceType ไม่ถูกต้อง' }, { status: 400 });
  }

  // อนุญาตไม่ส่ง currentStatus ได้ (ให้ค่าเริ่มต้น)
  const currentStatus: StatusEnum = isEnumValue(currentStatusRaw, StatusEnum)
    ? (currentStatusRaw as StatusEnum)
    : StatusEnum.WAITING_FOR_CUSTOMER_DEVICE;

  // ---- resolve customerId ----
  let customerId: number | null = null;

  if (isNewCustomer) {
    const fullName = trimOrEmpty(customerData?.fullName);
    const phone = trimOrEmpty(customerData?.phone);
    const email = trimOrEmpty(customerData?.email);

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'ข้อมูลลูกค้าใหม่ไม่ครบถ้วน' }, { status: 400 });
    }

    try {
      const newCustomer = await prisma.customer.create({
        data: {
          fullName,
          phone,
          email: email || null,
        },
        select: { id: true },
      });
      customerId = newCustomer.id;
    } catch (e) {
      // หาก unique ซ้ำ (เช่นเบอร์โทร/email) อาจต้องส่ง 409 แต่ที่นี่รวมเป็น 500 ตาม requirement เดิม
      const msg = e instanceof Error ? e.message : 'บันทึกลูกค้าใหม่ไม่สำเร็จ';
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } else {
    const selectedId = toInt(selectedCustomer?.id);
    if (selectedId == null) {
      return NextResponse.json({ error: 'กรุณาเลือกลูกค้าเก่าให้ถูกต้อง' }, { status: 400 });
    }
    // verify existing customer
    const exists = await prisma.customer.findUnique({ where: { id: selectedId }, select: { id: true } });
    if (!exists) {
      return NextResponse.json({ error: 'ไม่พบบัญชีลูกค้าที่เลือก' }, { status: 404 });
    }
    customerId = selectedId;
  }

  try {
    const newDevice = await prisma.device.create({
      data: {
        customerId: customerId as number,
        brandId,
        modelId: modelId ?? undefined,
        deviceType: deviceTypeRaw as DeviceType,
        serialNumber, // schema.prisma ต้องเป็น serialNumber ตามที่ใช้อยู่
        capacity,
        description,
        currentStatus,
        receivedAt,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: newDevice.id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูลอุปกรณ์';
    console.error('❌ register-device POST error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
