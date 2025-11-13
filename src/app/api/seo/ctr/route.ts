import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, gscData } from "@/lib/db/schema";
import { eq, and, gte, sql, isNull } from "drizzle-orm";

/**
 * CTR分析データ取得
 * GET /api/seo/ctr?siteId=xxx&period=30d
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
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

    // 日別CTRデータ（集計データのみ、クエリ/ページ/国/デバイスがnull）
    const dailyCTR = await db
      .select({
        date: gscData.date,
        clicks: sql<number>`sum(${gscData.clicks})`,
        impressions: sql<number>`sum(${gscData.impressions})`,
        ctr: sql<number>`avg(${gscData.ctr})`,
        position: sql<number>`avg(${gscData.position})`,
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

    return NextResponse.json(
      {
        daily: dailyCTR.map((d) => ({
          date: d.date,
          clicks: Number(d.clicks) || 0,
          impressions: Number(d.impressions) || 0,
          ctr: Number(d.ctr) || 0,
          position: Number(d.position) || 0,
        })),
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CTR stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

