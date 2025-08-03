// brand/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await createServerClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("\uD83D\uDCCC USER:", user);

  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  const { data, error } = await supabase.from("Brand").select("*").order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    const body = await req.json();
    const { name } = body;

    console.log("\uD83D\uDD0D Received Name:", name);
    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อแบรนด์" }, { status: 400 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("\uD83D\uDCCC USER:", user);

    if (!user) {
      return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
    }

    const { data: exists, error: existsError } = await supabase
      .from("Brand")
      .select("id")
      .eq("name", name)
      .maybeSingle();

    if (existsError) {
      console.error("\u274C Brand Exists Check Error:", existsError);
      return NextResponse.json({ error: "ไม่สามารถตรวจสอบชื่อแบรนด์ได้" }, { status: 500 });
    }

    if (exists) {
      return NextResponse.json({ error: "มีชื่อแบรนด์นี้อยู่แล้ว" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Brand")
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error("\u274C Insert Brand Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("\u274C Unexpected Error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" }, { status: 500 });
  }
}


