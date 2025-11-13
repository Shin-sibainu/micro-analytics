import { NextRequest, NextResponse } from "next/server";
import { requireAuthForAPI } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { GSCClient } from "@/lib/gsc/client";
import { getValidAccessToken } from "@/lib/gsc/token-refresh";

/**
 * GSC統計データを取得
 * GET /api/gsc/stats?siteId=xxx&period=7d|30d|90d
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await requireAuthForAPI();

    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const period = searchParams.get("period") || "7d"; // デフォルト7日

    if (!siteId) {
      return NextResponse.json({ error: "siteId が必要です" }, { status: 400 });
    }

    // サイトの所有権確認
    const [site] = await db
      .select()
      .from(sites)
      .where(eq(sites.id, siteId))
      .limit(1);

    if (!site) {
      return NextResponse.json(
        { error: "サイトが見つかりません" },
        { status: 404 }
      );
    }

    if (site.userId !== session.user.id) {
      return NextResponse.json(
        { error: "このサイトへのアクセス権限がありません" },
        { status: 403 }
      );
    }

    // GSC連携が有効でない場合
    if (!site.gscEnabled || !site.gscConfig) {
      return NextResponse.json(
        { error: "GSC連携が有効になっていません" },
        { status: 400 }
      );
    }

    const gscConfig = site.gscConfig as { siteUrl: string };
    const gscSiteUrl = gscConfig.siteUrl;

    // 有効なアクセストークンを取得（期限切れの場合は自動リフレッシュ）
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(session.user.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "不明なエラー";
      console.error("アクセストークン取得エラー:", errorMessage);
      return NextResponse.json(
        {
          error:
            "Googleアカウントの連携が見つかりません。再度ログインしてください。",
          requiresReauth: true,
        },
        { status: 401 }
      );
    }

    // 期間を計算
    const endDate = new Date();
    const startDate = new Date();
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setDate(endDate.getDate() - 7);
    }

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // GSCクライアントを作成
    const gscClient = new GSCClient(accessToken);

    // 日別データを取得
    const dailyData = await gscClient.getDailySearchAnalytics(
      gscSiteUrl,
      startDateStr,
      endDateStr
    );

    // クエリ別データを取得（上位20件）
    const queryData = await gscClient.getQuerySearchAnalytics(
      gscSiteUrl,
      startDateStr,
      endDateStr,
      20
    );

    // ページ別データを取得（上位20件）
    const pageData = await gscClient.getPageSearchAnalytics(
      gscSiteUrl,
      startDateStr,
      endDateStr,
      20
    );

    // 統計を計算
    const rows = dailyData.rows || [];
    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce(
      (sum, row) => sum + (row.impressions || 0),
      0
    );
    const avgCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const totalPosition = rows.reduce(
      (sum, row) => sum + (row.position || 0),
      0
    );
    const avgPosition = rows.length > 0 ? totalPosition / rows.length : 0;

    return NextResponse.json({
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      summary: {
        clicks: totalClicks,
        impressions: totalImpressions,
        ctr: Number(avgCTR.toFixed(2)),
        position: Number(avgPosition.toFixed(1)),
      },
      daily: dailyData.rows || [],
      queries: queryData.rows || [],
      pages: pageData.rows || [],
    });
  } catch (error) {
    console.error("GSC統計取得エラー:", error);
    const errorMessage =
      error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { error: `GSC統計取得エラー: ${errorMessage}` },
      { status: 500 }
    );
  }
}
