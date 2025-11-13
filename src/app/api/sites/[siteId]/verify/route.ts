import { NextRequest, NextResponse } from "next/server";
import { requireAuthForAPI } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites, events } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";

interface VerifyRouteParams {
  params: Promise<{
    siteId: string;
  }>;
}

/**
 * トラッキングコードの設置状態を検証
 * GET /api/sites/[siteId]/verify
 */
export async function GET(
  request: NextRequest,
  { params }: VerifyRouteParams
) {
  try {
    const session = await requireAuthForAPI();
    const { siteId } = await params;

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

    // 方法1: 最近のイベントデータがあるか確認（過去24時間以内）
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentEvent] = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.siteId, siteId),
          gte(events.timestamp, oneDayAgo)
        )
      )
      .limit(1);

    if (recentEvent) {
      return NextResponse.json({
        verified: true,
        method: "events",
        message: "トラッキングコードは正常に動作しています",
        lastEventAt: recentEvent.timestamp,
      });
    }

    // 方法2: HTMLを取得してトラッキングコードが含まれているか確認
    try {
      const protocol = site.domain.startsWith("localhost") ? "http" : "https";
      const url = `${protocol}://${site.domain}`;
      
      // タイムアウト用のAbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CoffeeAnalytics/1.0; +https://coffeeanalytics.com)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({
          verified: false,
          method: "html",
          message: "サイトにアクセスできませんでした",
          error: `HTTP ${response.status}`,
        });
      }

      const html = await response.text();
      
      // より柔軟な検証パターン
      // 1. Plausible形式: /js/ca-{trackingId}.js への参照があるか
      if (!site.trackingId) {
        return NextResponse.json(
          { error: "トラッキングIDが設定されていません" },
          { status: 400 }
        );
      }
      const trackingIdPattern = site.trackingId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const plausiblePattern = new RegExp(
        `ca-${trackingIdPattern}\\.js`,
        "i"
      );
      
      // 2. 旧形式: data-site属性にtrackingIdが含まれているか（後方互換性のため）
      const dataSitePattern = new RegExp(
        `data-site=["']${trackingIdPattern}["']`,
        "i"
      );
      
      // 3. ca.jsへの参照があるか（相対パス、絶対パス、プロトコル相対パスすべてに対応）
      const scriptSrcPatterns = [
        new RegExp(`src=["'][^"']*ca-${trackingIdPattern}\\.js["']`, "i"),  // Plausible形式
        /src=["']\/ca\.js["']/i,  // 旧形式: 相対パス /ca.js
        /src=["']https?:\/\/[^"']*\/ca\.js["']/i,  // 旧形式: 絶対パス
        /src=["']\/\/[^"']*\/ca\.js["']/i,  // 旧形式: プロトコル相対パス
        /src=["'][^"']*ca\.js["']/i,  // その他のパス
      ];
      
      // 4. 検証
      const hasPlausibleFormat = plausiblePattern.test(html);
      const hasDataSite = dataSitePattern.test(html);
      const hasScriptSrc = scriptSrcPatterns.some(pattern => pattern.test(html));
      
      // デバッグ情報
      const debugInfo = {
        htmlLength: html.length,
        hasDataSite,
        hasScriptSrc,
        foundPatterns: [] as string[],
      };
      
      // どのパターンがマッチしたか記録
      scriptSrcPatterns.forEach((pattern, index) => {
        if (pattern.test(html)) {
          debugInfo.foundPatterns.push(`pattern-${index}`);
        }
      });
      
      // HTMLの一部を抽出して確認（デバッグ用）
      const scriptTagMatch = html.match(/<script[^>]*data-site[^>]*>/i);
      if (scriptTagMatch) {
        debugInfo.foundPatterns.push(`script-tag-found: ${scriptTagMatch[0].substring(0, 100)}`);
      }

          // Plausible形式または旧形式のいずれかが検出された場合
          if (hasPlausibleFormat || (hasDataSite && hasScriptSrc)) {
            return NextResponse.json({
              verified: true,
              method: "html",
              message: "トラッキングコードが検出されました",
              format: hasPlausibleFormat ? "plausible" : "legacy",
              debug: debugInfo,
            });
          }

      return NextResponse.json({
        verified: false,
        method: "html",
        message: "トラッキングコードが見つかりませんでした",
        suggestion:
          "トラッキングコードが正しく設置されているか確認してください。HTMLの<head>タグ内に追加されているか確認してください。",
        debug: debugInfo,
      });
    } catch (fetchError) {
      // HTML取得に失敗した場合
      return NextResponse.json({
        verified: false,
        method: "html",
        message: "サイトの検証に失敗しました",
        error:
          fetchError instanceof Error ? fetchError.message : "不明なエラー",
      });
    }
  } catch (error) {
    console.error("トラッキング検証エラー:", error);
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    );
  }
}

