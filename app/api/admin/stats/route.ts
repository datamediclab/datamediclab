// app/api/admin/stats/route.ts
import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const supabase = await createServerClient();

  try {
    const [{ count: brand }, { count: customer }, { count: device }, { count: recoveryJob }] = await Promise.all([
      supabase.from('brand').select('*', { count: 'exact', head: true }),
      supabase.from('customer').select('*', { count: 'exact', head: true }),
      supabase.from('device').select('*', { count: 'exact', head: true }),
      supabase.from('recoveryjob').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      brand: brand || 0,
      customer: customer || 0,
      device: device || 0,
      recoveryJob: recoveryJob || 0,
    });
  } catch (error) {
    console.error('GET /api/admin/stats', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
};
