// lib/supabaseServer.ts

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase"; // แก้ตามโครงสร้างโปรเจกต์ของคุณ

export const createServerClient = async (
  cookieStore?: ReadonlyRequestCookies
): Promise<SupabaseClient<Database>> => {
  const store = cookieStore ?? (await cookies());
  return createServerComponentClient<Database>({ cookies: () => store });
};
