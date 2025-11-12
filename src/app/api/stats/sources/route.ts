import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, sites } from "@/lib/db/schema";
import { eq, and, gte, sql, isNotNull } from "drizzle-orm";

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
      const mockSources = [
        { domain: "Google", visitors: 1245, pageviews: 3456 },
        { domain: "Direct", visitors: 789, pageviews: 2234 },
        { domain: "twitter.com", visitors: 456, pageviews: 1234 },
        { domain: "github.com", visitors: 234, pageviews: 678 },
        { domain: "qiita.com", visitors: 189, pageviews: 567 },
        { domain: "zenn.dev", visitors: 156, pageviews: 445 },
        { domain: "note.com", visitors: 123, pageviews: 345 },
        { domain: "hatenablog.com", visitors: 98, pageviews: 234 },
      ];

      return NextResponse.json(
        {
          sources: mockSources.slice(0, limit),
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

    // リファラーをドメインに変換する関数（SQLiteでは簡易的に実装）
    const sourceStats = await db
      .select({
        referrer: events.referrer,
        visitors: sql<number>`count(distinct ${events.visitorHash})`,
        pageviews: sql<number>`count(*)`,
      })
      .from(events)
      .where(
        and(
          eq(events.siteId, site.id),
          isNotNull(events.referrer),
          gte(events.timestamp, new Date(startDate * 1000))
        )
      )
      .groupBy(events.referrer)
      .orderBy(sql`count(distinct ${events.visitorHash}) desc`)
      .limit(limit);

    // リファラーをドメインに変換
    const sources = sourceStats.map((stat) => {
      let domain = "Direct";
      if (stat.referrer) {
        try {
          const url = new URL(stat.referrer);
          domain = url.hostname.replace("www.", "");
        } catch {
          domain = stat.referrer;
        }
      }
      return {
        ...stat,
        domain,
      };
    });

    // ドメインごとに集計
    const domainStats = sources.reduce((acc, stat) => {
      const existing = acc.find((s) => s.domain === stat.domain);
      if (existing) {
        existing.visitors += stat.visitors;
        existing.pageviews += stat.pageviews;
      } else {
        acc.push({
          domain: stat.domain,
          visitors: stat.visitors,
          pageviews: stat.pageviews,
        });
      }
      return acc;
    }, [] as Array<{ domain: string; visitors: number; pageviews: number }>);

    return NextResponse.json(
      {
        sources: domainStats.sort((a, b) => b.visitors - a.visitors).slice(0, limit),
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sources stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

