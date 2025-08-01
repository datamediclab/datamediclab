// src/app/api/track-status/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone)
    return NextResponse.json({ error: "No phone provided" }, { status: 400 });

  const { data, error } = await supabase
    .from("device_registrations")
    .select("currentStatus, createdAt") // เปลี่ยนจาก problem → currentStatus
    .eq("phone", phone)
    .order("createdAt", { ascending: false })
    .limit(1)
    .single();

  if (error || !data)
    return NextResponse.json({ currentStatus: "ไม่พบข้อมูล" }, { status: 404 });

  return NextResponse.json({
    currentStatus: data.currentStatus || "ยังไม่มีสถานะ",
    updatedAt: new Date(data.createdAt).toLocaleString("th-TH"),
  });
}
