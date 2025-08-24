// app/api/track/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const onlyDigits = (s: string | null) => String(s ?? "").replace(/\D/g, "");

// ---- Device typing (no any) ----
type DeviceSelect = {
  currentStatus: true;
  updatedAt: true;
  receivedAt: true;
  createdAt: true;
  description: true;
  deviceType: true;
  serialNumber: true;
  brand: { select: { name: true } };
  model: { select: { name: true } };
  id: true;
};
type DeviceRecord = Prisma.DeviceGetPayload<{ select: DeviceSelect }>;

const DEVICE_SELECT: DeviceSelect = {
  currentStatus: true,
  updatedAt: true,
  receivedAt: true,
  createdAt: true,
  description: true,
  deviceType: true,
  serialNumber: true,
  brand: { select: { name: true } },
  model: { select: { name: true } },
  id: true,
};

// ---- handlers ----
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerIdParam = searchParams.get("customerId");
    const last4 = onlyDigits(searchParams.get("last4"));
    const phoneParam = onlyDigits(searchParams.get("phone"));
    const includeAll = searchParams.get("all") === "1";

    // --- ยืนยัน customerId + last4 ---
    if (customerIdParam && last4) {
      const id = Number(customerIdParam);
      if (!Number.isFinite(id)) return new Response("customerId ไม่ถูกต้อง", { status: 400 });

      const customer = await prisma.customer.findUnique({
        where: { id },
        select: { id: true, fullName: true, email: true, phone: true },
      });
      if (!customer) return new Response("ไม่พบบัญชีลูกค้านี้", { status: 404 });

      if (onlyDigits(customer.phone).slice(-4) !== last4.slice(-4)) {
        return new Response("เลข 4 ตัวท้ายไม่ถูกต้อง", { status: 403 });
      }

      if (includeAll) {
        const devices = await prisma.device.findMany({
          where: { customerId: customer.id },
          orderBy: [{ updatedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
          select: DEVICE_SELECT,
        });
        const list = devices.map((d) => toDto(d, customer.fullName, customer.email ?? null));
        return NextResponse.json(list);
      }

      const device = await prisma.device.findFirst({
        where: { customerId: customer.id },
        orderBy: [{ updatedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
        select: DEVICE_SELECT,
      });
      if (!device) return new Response("ไม่พบประวัติการรับอุปกรณ์ของลูกค้ารายนี้", { status: 404 });

      return NextResponse.json(toDto(device, customer.fullName, customer.email ?? null));
    }

    // --- โหมดเดิม: phone (back-compat) ---
    if (phoneParam) {
      const customer = await prisma.customer.findFirst({
        where: { phone: { contains: phoneParam } },
        select: { id: true, fullName: true, email: true, phone: true },
      });
      if (!customer) return new Response("ไม่พบข้อมูลจากระบบ", { status: 404 });

      if (includeAll) {
        const devices = await prisma.device.findMany({
          where: { customerId: customer.id },
          orderBy: [{ updatedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
          select: DEVICE_SELECT,
        });
        const list = devices.map((d) => toDto(d, customer.fullName, customer.email ?? null));
        return NextResponse.json(list);
      }

      const device = await prisma.device.findFirst({
        where: { customerId: customer.id },
        orderBy: [{ updatedAt: "desc" }, { receivedAt: "desc" }, { id: "desc" }],
        select: DEVICE_SELECT,
      });
      if (!device) return new Response("ไม่พบบันทึกอุปกรณ์", { status: 404 });

      return NextResponse.json(toDto(device, customer.fullName, customer.email ?? null));
    }

    return new Response("กรุณาระบุพารามิเตอร์สำหรับการค้นหา", { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "internal error";
    return new Response(msg, { status: 500 });
  }
}

// ---- pure helper (typed) ----
function toDto(device: DeviceRecord, customerName: string, email: string | null) {
  return {
    id: device.id,
    currentStatus: String(device.currentStatus),
    updatedAt: (device.updatedAt ?? device.receivedAt ?? device.createdAt ?? new Date()).toISOString(),
    name: customerName,
    email,
    deviceType: device.deviceType ?? null,
    deviceBrand: device.brand?.name ?? null,
    deviceModel: device.model?.name ?? null,
    deviceSerialN: device.serialNumber ?? null,
    problem: device.description ?? null,
  };
};










