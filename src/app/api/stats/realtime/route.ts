import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, sites } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId parameter is required" },
        { status: 400 }
      );
    }

    // デモサイトの場合はモックデータを返す（リアルタイムなので変動させる）
    if (siteId === "demo") {
      // 5-15人の間でランダムに変動
      const visitors = Math.floor(Math.random() * 10) + 5;
      return NextResponse.json({ visitors }, { status: 200 });
    }

    // trackingIdからsiteIdを取得
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.trackingId, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // 過去30分以内のユニークセッション数を取得
    const thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 30 * 60;

    const realtimeEvents = await db
      .selectDistinct({ sessionHash: events.sessionHash })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(thirtyMinutesAgo * 1000))
        )
      );

    const visitors = realtimeEvents.length;

    return NextResponse.json({ visitors }, { status: 200 });
  } catch (error) {
    console.error("Realtime stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

