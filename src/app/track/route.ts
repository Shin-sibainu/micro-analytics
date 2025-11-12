import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events, sites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // バリデーション
    if (!data.siteId || !data.eventType || !data.visitorHash || !data.sessionHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // サイトの存在確認とトラッキング有効性チェック
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.trackingId, data.siteId))
      .limit(1);

    if (!site || !site.trackingEnabled) {
      return NextResponse.json(
        { error: 'Site not found or tracking disabled' },
        { status: 404 }
      );
    }

    // イベントデータの準備
    const eventData = {
      siteId: site.id,
      eventType: data.eventType,
      visitorHash: data.visitorHash,
      sessionHash: data.sessionHash,
      url: data.url || null,
      path: data.path || null,
      title: data.title || null,
      referrer: data.referrer || null,
      deviceType: data.deviceType || null,
      screenSize: data.screenSize || null,
      browser: data.browser || null,
      os: data.os || null,
      country: data.country || null, // TODO: IPから国を判定
      eventName: data.eventName || null,
      eventValue: data.eventValue || null,
      timestamp: new Date(data.timestamp * 1000),
    };

    // データベースに保存
    await db.insert(events).values(eventData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Beacon API用のOPTIONSハンドラー
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

