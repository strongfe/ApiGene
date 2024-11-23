import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성을 함수로 분리
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not properly configured');
  }

  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  try {
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ 
        success: false,
        message: '잘못된 요청 형식입니다.'
      }, { status: 400 });
    }

    const { key } = body;

    if (!key) {
      return NextResponse.json({ 
        success: false,
        message: 'API 키가 필요합니다.'
      }, { status: 400 });
    }

    // Supabase 클라이언트 생성
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false,
        message: '데이터베이스 조회 중 오류가 발생했습니다.'
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ 
        success: false,
        message: '유효하지 않은 API 키입니다.'
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'API 키가 유효합니다.',
      data: {
        id: data.id,
        name: data.name,
        usage: data.usage,
        usage_limit: data.usage_limit,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 });
  }
} 