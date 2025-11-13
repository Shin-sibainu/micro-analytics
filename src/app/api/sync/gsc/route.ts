import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sites, gscData } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { GSCClient } from "@/lib/gsc/client";

/**
 * GSCデータ同期（バッチ処理用）
 * POST /api/sync/gsc
 * 
 * Vercel Cron Jobsから呼び出される想定
 * Authorization: Bearer <CRON_SECRET> で保護
 */
export async function POST(request: NextRequest) {
  try {
    // Cron Jobs認証（本番環境では必須）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    // GSC連携が有効なサイトを取得
    const gscEnabledSites = await db
      .select()
      .from(sites)
      .where(eq(sites.gscEnabled, true));

    if (gscEnabledSites.length === 0) {
      return NextResponse.json({
        success: true,
        message: "GSC連携が有効なサイトがありません",
        synced: 0,
      });
    }

    const syncedSites: string[] = [];
    const errors: Array<{ siteId: string; error: string }> = [];

    // 各サイトのデータを同期
    for (const site of gscEnabledSites) {
      try {
        const config = site.gscConfig as any;
        if (!config?.accessToken || !config?.siteUrl) {
          errors.push({
            siteId: site.id,
            error: "GSC設定が不完全です",
          });
          continue;
        }

        const gscClient = new GSCClient(config.accessToken);

        // 過去30日間のデータを取得
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const startDateStr = startDate.toISOString().split("T")[0];
        const endDateStr = endDate.toISOString().split("T")[0];

        // 日別データを取得
        const dailyData = await gscClient.getDailySearchAnalytics(
          config.siteUrl,
          startDateStr,
          endDateStr
        );

        // データベースに保存
        for (const row of dailyData.rows || []) {
          // 日付を取得（keys[0]が日付の場合）
          const date = row.keys[0] || endDateStr;

          // 既存データをチェック
          const existing = await db
            .select()
            .from(gscData)
            .where(
              and(
                eq(gscData.siteId, site.id),
                eq(gscData.date, date),
                sql`${gscData.query} IS NULL`,
                sql`${gscData.page} IS NULL`,
                sql`${gscData.country} IS NULL`,
                sql`${gscData.device} IS NULL`
              )
            )
            .limit(1);

          if (existing.length > 0) {
            // 更新
            await db
              .update(gscData)
              .set({
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
              })
              .where(eq(gscData.id, existing[0].id));
          } else {
            // 新規作成
            await db.insert(gscData).values({
              siteId: site.id,
              date,
              clicks: row.clicks,
              impressions: row.impressions,
              ctr: row.ctr,
              position: row.position,
            });
          }
        }

        // クエリ別データを取得（上位100件）
        const queryData = await gscClient.getQuerySearchAnalytics(
          config.siteUrl,
          startDateStr,
          endDateStr,
          100
        );

        for (const row of queryData.rows || []) {
          const query = row.keys[0];
          const date = endDateStr; // 集計期間の最終日

          const existing = await db
            .select()
            .from(gscData)
            .where(
              and(
                eq(gscData.siteId, site.id),
                eq(gscData.date, date),
                eq(gscData.query, query),
                sql`${gscData.page} IS NULL`,
                sql`${gscData.country} IS NULL`,
                sql`${gscData.device} IS NULL`
              )
            )
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(gscData)
              .set({
                clicks: row.clicks,
                impressions: row.impressions,
                ctr: row.ctr,
                position: row.position,
              })
              .where(eq(gscData.id, existing[0].id));
          } else {
            await db.insert(gscData).values({
              siteId: site.id,
              date,
              query,
              clicks: row.clicks,
              impressions: row.impressions,
              ctr: row.ctr,
              position: row.position,
            });
          }
        }

        syncedSites.push(site.id);
      } catch (error) {
        console.error(`サイト ${site.id} の同期エラー:`, error);
        errors.push({
          siteId: site.id,
          error: error instanceof Error ? error.message : "不明なエラー",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${syncedSites.length}件のサイトを同期しました`,
      synced: syncedSites.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("GSCデータ同期エラー:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
}

