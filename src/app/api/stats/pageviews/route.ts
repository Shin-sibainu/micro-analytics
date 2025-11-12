import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, sites } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const period = searchParams.get("period") || "7d";

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId parameter is required" },
        { status: 400 }
      );
    }

    // デモサイトの場合はモックデータを返す
    if (siteId === "demo") {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const dailyPageviews = [];
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        // ページビューは訪問者数の2-3倍程度（上昇トレンド）
        const baseValue = 1500 + (days - i) * 30;
        const randomVariation = Math.random() * 500 - 250;
        const pageviews = Math.max(1200, Math.floor(baseValue + randomVariation));
        dailyPageviews.push({
          date: dateStr,
          pageviews,
        });
      }

      return NextResponse.json(
        {
          total: dailyPageviews.reduce((sum, d) => sum + d.pageviews, 0),
          daily: dailyPageviews,
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

    // 期間内の総ページビュー数
    const totalPageviews = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          eq(events.eventType, "pageview"),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      );

    // 日別のページビュー数
    const dailyPageviews = await db
      .select({
        date: events.date,
        pageviews: sql<number>`count(*)`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          eq(events.eventType, "pageview"),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.date)
      .orderBy(events.date);

    return NextResponse.json(
      {
        total: Number(totalPageviews[0]?.count || 0),
        daily: dailyPageviews,
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pageviews stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

