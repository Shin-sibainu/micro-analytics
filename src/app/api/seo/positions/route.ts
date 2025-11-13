import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, gscData } from "@/lib/db/schema";
import { eq, and, isNotNull, gte, sql, isNull } from "drizzle-orm";

/**
 * 検索順位推移データ取得
 * GET /api/seo/positions?siteId=xxx&query=xxx&period=30d
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const query = searchParams.get("query");
    const period = searchParams.get("period") || "30d";

    if (!siteId) {
      return NextResponse.json(
        { error: "siteId parameter is required" },
        { status: 400 }
      );
    }

    // サイトのGSC連携確認
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (!site.gscEnabled) {
      return NextResponse.json(
        { error: "GSC連携が有効になっていません" },
        { status: 400 }
      );
    }

    // 期間の計算
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    let positions;

    if (query) {
      // 特定のクエリの順位推移
      positions = await db
        .select({
          date: gscData.date,
          position: sql<number>`avg(${gscData.position})`,
          clicks: sql<number>`sum(${gscData.clicks})`,
          impressions: sql<number>`sum(${gscData.impressions})`,
        })
        .from(gscData)
        .where(
          and(
            eq(gscData.siteId, siteId),
            eq(gscData.query, query),
            isNull(gscData.page),
            isNull(gscData.country),
            isNull(gscData.device),
            gte(gscData.date, startDateStr)
          )
        )
        .groupBy(gscData.date)
        .orderBy(gscData.date);
    } else {
      // 全体の平均順位推移
      positions = await db
        .select({
          date: gscData.date,
          position: sql<number>`avg(${gscData.position})`,
          clicks: sql<number>`sum(${gscData.clicks})`,
          impressions: sql<number>`sum(${gscData.impressions})`,
        })
        .from(gscData)
        .where(
          and(
            eq(gscData.siteId, siteId),
            isNull(gscData.query),
            isNull(gscData.page),
            isNull(gscData.country),
            isNull(gscData.device),
            gte(gscData.date, startDateStr)
          )
        )
        .groupBy(gscData.date)
        .orderBy(gscData.date);
    }

    return NextResponse.json(
      {
        positions: positions.map((p) => ({
          date: p.date,
          position: Number(p.position) || 0,
          clicks: Number(p.clicks) || 0,
          impressions: Number(p.impressions) || 0,
        })),
        period,
        query: query || "全体",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Positions stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

