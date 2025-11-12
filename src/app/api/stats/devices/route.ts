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
      return NextResponse.json(
        {
          devices: [
            { deviceType: "desktop", count: 1245 },
            { deviceType: "mobile", count: 998 },
            { deviceType: "tablet", count: 134 },
          ],
          browsers: [
            { browser: "Chrome", count: 1567 },
            { browser: "Safari", count: 456 },
            { browser: "Firefox", count: 234 },
            { browser: "Edge", count: 120 },
          ],
          os: [
            { os: "Windows", count: 1123 },
            { os: "macOS", count: 678 },
            { os: "iOS", count: 456 },
            { os: "Android", count: 120 },
          ],
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

    // デバイス種別の統計
    const deviceStats = await db
      .select({
        deviceType: events.deviceType,
        count: sql<number>`count(distinct ${events.visitorHash})`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.deviceType);

    // ブラウザの統計
    const browserStats = await db
      .select({
        browser: events.browser,
        count: sql<number>`count(distinct ${events.visitorHash})`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.browser);

    // OSの統計
    const osStats = await db
      .select({
        os: events.os,
        count: sql<number>`count(distinct ${events.visitorHash})`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.os);

    return NextResponse.json(
      {
        devices: deviceStats,
        browsers: browserStats,
        os: osStats,
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Devices stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

