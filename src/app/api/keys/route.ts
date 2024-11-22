import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(apiKeys);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const { data: newKey, error } = await supabase
    .from('api_keys')
    .insert([{
      name: body.name,
      key: `sk-${crypto.randomUUID()}`,
      usage: 0,
      usage_limit: body.limit,
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(newKey);
}

