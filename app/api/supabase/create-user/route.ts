// /app/api/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';


export async function POST(req: NextRequest) {
  const { user_id, referred_by } = await req.json();

  const { error } = await supabaseAdmin
    .from('users')
    .insert([{ id: user_id, referred_by }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

