import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, gscData } from "@/lib/db/schema";
import { eq, and, isNotNull, gte, sql } from "drizzle-orm";

/**
 * キーワードランキング取得
 * GET /api/seo/keywords?siteId=xxx&period=7d&limit=10
 */
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

    // キーワード別の集計（クエリが存在するデータのみ）
    const keywords = await db
      .select({
        query: gscData.query,
        clicks: sql<number>`sum(${gscData.clicks})`,
        impressions: sql<number>`sum(${gscData.impressions})`,
        ctr: sql<number>`avg(${gscData.ctr})`,
        position: sql<number>`avg(${gscData.position})`,
      })
      .from(gscData)
      .where(
        and(
          eq(gscData.siteId, siteId),
          isNotNull(gscData.query),
          gte(gscData.date, startDateStr)
        )
      )
      .groupBy(gscData.query)
      .orderBy(sql`sum(${gscData.clicks}) desc`)
      .limit(limit);

    return NextResponse.json(
      {
        keywords: keywords.map((k) => ({
          query: k.query,
          clicks: Number(k.clicks) || 0,
          impressions: Number(k.impressions) || 0,
          ctr: Number(k.ctr) || 0,
          position: Number(k.position) || 0,
        })),
        period,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Keywords stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

