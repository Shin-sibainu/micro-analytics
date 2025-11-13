import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// ca.jsスクリプトを配信
export const runtime = 'nodejs'; // Node.js runtimeを使用してファイルを読み込む

export async function GET(request: NextRequest) {
  try {
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

