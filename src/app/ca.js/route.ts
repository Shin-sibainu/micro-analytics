import { NextRequest, NextResponse } from 'next/server';

// Edge Runtimeでは静的ファイルを直接配信できないため、
// 実際の実装ではpublic/ca.jsをCDNから配信するか、
// またはこのルートでスクリプトを動的に生成します
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // public/ca.jsを直接配信する代わりに、
  // リダイレクトまたはインラインスクリプトを返す
  // 本番環境ではCDNから配信することを推奨
  
  return NextResponse.redirect(new URL('/ca.js', request.url), {
    status: 307,
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

