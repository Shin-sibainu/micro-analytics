import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// 動的なトラッキングスクリプトを配信
// URL形式: /js/ca-{trackingId}.js
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{
    trackingId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { trackingId } = await params;
    
    // trackingIdがca-で始まる場合のみ処理
    if (!trackingId.startsWith('ca-')) {
      return NextResponse.json(
        { error: 'Invalid tracking script' },
        { status: 404 }
      );
    }
    
    // ca-プレフィックスを除去してtrackingIdを取得
    const siteId = trackingId.replace(/^ca-/, '');
    
    // public/ca.jsを読み込む
    const filePath = join(process.cwd(), 'public', 'ca.js');
    const scriptContent = readFileSync(filePath, 'utf-8');
    
    return new NextResponse(scriptContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*', // CORS対応
      },
    });
  } catch (error) {
    console.error('Failed to serve ca.js:', error);
    return NextResponse.json(
      { error: 'Failed to serve tracking script' },
      { status: 500 }
    );
  }
}

