// =============================
// File: app/api/track/search/route.ts
// =============================
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskPhone(phone: string): string {
  const d = String(phone || "").replace(/\D/g, "");
  return d.length >= 4 ? `XXX-XXX-${d.slice(-4)}` : "ไม่ระบุ";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json([]);
  const digits = q.replace(/\D/g, "");

  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          ...(digits ? [{ phone: { contains: digits } }] : []),
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, fullName: true, email: true, phone: true },
      take: 20,
      orderBy: { id: "desc" },
    });

    const items = customers.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email ?? null,      // <-- added
      maskedPhone: maskPhone(c.phone),
    }));

    return NextResponse.json(items);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "search failed";
    return new Response(msg, { status: 500 });
  }
}
