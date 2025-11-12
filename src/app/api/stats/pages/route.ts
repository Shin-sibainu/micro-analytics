import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, sites } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const period = searchParams.get("period") || "7d";
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId parameter is required" },
        { status: 400 }
      );
    }

    // デモサイトの場合はモックデータを返す
    if (siteId === "demo") {
      const mockPages = [
        { path: "/blog/seo-tips", title: "SEOのベストプラクティス", pageviews: 512, visitors: 423 },
        { path: "/blog/ga4-tutorial", title: "GA4完全ガイド", pageviews: 489, visitors: 398 },
        { path: "/", title: "ホームページ", pageviews: 423, visitors: 356 },
        { path: "/product/pricing", title: "料金プラン", pageviews: 301, visitors: 267 },
        { path: "/blog/analytics-101", title: "Web分析入門", pageviews: 278, visitors: 234 },
        { path: "/about", title: "会社概要", pageviews: 245, visitors: 198 },
        { path: "/contact", title: "お問い合わせ", pageviews: 189, visitors: 156 },
        { path: "/blog/privacy-first", title: "プライバシー重視の分析", pageviews: 167, visitors: 142 },
        { path: "/features", title: "機能一覧", pageviews: 156, visitors: 134 },
        { path: "/docs/getting-started", title: "はじめに", pageviews: 134, visitors: 112 },
      ];

      return NextResponse.json(
        {
          pages: mockPages.slice(0, limit),
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

    // ページ別統計
    const pageStats = await db
      .select({
        path: events.path,
        title: events.title,
        pageviews: sql<number>`count(*)`,
        visitors: sql<number>`count(distinct ${events.visitorHash})`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          eq(events.eventType, "pageview"),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.path, events.title)
      .orderBy(sql`count(*) desc`)
      .limit(limit);

    return NextResponse.json(
      {
        pages: pageStats,
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Pages stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

