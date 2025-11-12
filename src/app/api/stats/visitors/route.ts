import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, sites } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const period = searchParams.get("period") || "7d"; // 7d, 30d, 90d

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId parameter is required" },
        { status: 400 }
      );
    }

    // デモサイトの場合はモックデータを返す
    if (siteId === "demo") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const dailyVisitors = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        // 現実的な変動のあるデータを生成（上昇トレンド）
        const baseValue = 600 + (days - i) * 12;
        const randomVariation = Math.random() * 200 - 100;
        const visitors = Math.max(500, Math.floor(baseValue + randomVariation));
        dailyVisitors.push({
          date: dateStr,
          visitors,
        });
      }

      return NextResponse.json(
        {
          total: dailyVisitors.reduce((sum, d) => sum + d.visitors, 0),
          daily: dailyVisitors,
          period,
        },
        { status: 200 }
      );
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

    // 期間の計算
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    // 期間内のユニーク訪問者数
    const uniqueVisitors = await db
      .selectDistinct({ visitorHash: events.visitorHash })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      );

    // 日別の訪問者数
    const dailyVisitors = await db
      .select({
        date: events.date,
        visitors: sql<number>`count(distinct ${events.visitorHash})`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.date)
      .orderBy(events.date);

    return NextResponse.json(
      {
        total: uniqueVisitors.length,
        daily: dailyVisitors,
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Visitors stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

