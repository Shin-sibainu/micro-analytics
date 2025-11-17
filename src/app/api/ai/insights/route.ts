import { NextRequest, NextResponse } from "next/server";
import { requireAuthForAPI } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites, events } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { generateAIInsights } from "@/lib/ai/gemini";
import { headers } from "next/headers";

export interface Insight {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems: string[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const siteId = searchParams.get("siteId");
    const period = searchParams.get("period") || "7d";

    if (!siteId) {
      return NextResponse.json({ error: "siteId が必要です" }, { status: 400 });
    }

    // デモサイトの場合はモックデータを返す
    if (siteId === "demo") {
      return NextResponse.json({
        insights: [
          {
            category: "SEO",
            priority: "high",
            title: "関連検索クエリの順位とCTR向上",
            description: '"youtube サムネ ai"などの関連キーワードで平均順位が2位台、クリック率（CTR）: 検索結果に表示された回数に対して、実際にクリックされた割合が8%程度です。上位表示を維持しつつ、メタタイトルとディスクリプションを最適化してCTRを10%以上に向上させましょう。',
            actionItems: [
              "メタタイトルに数字や具体的なベネフィットを追加（例: 「AIで3秒生成」）",
              "ディスクリプションにCTA（Call to Action）を追加",
              "構造化データ（Schema.org）を追加してリッチスニペットを狙う",
            ],
          },
        ],
      });
    }

    const session = await requireAuthForAPI();

    // サーバーサイドのfetch用にクッキーを転送
    const cookieHeader = request.headers.get("cookie") || "";

    // サイトの所有権確認
    const site = await db.query.sites.findFirst({
      where: eq(sites.id, siteId),
    });

    if (!site || site.userId !== session.user.id) {
      return NextResponse.json({ error: "サイトが見つかりません" }, { status: 404 });
    }

    // 期間を計算
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // ルールベースのインサイトを生成
    const ruleBasedInsights: Insight[] = [];

    // 訪問者数とページビュー数を取得
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    const visitorsRes = await fetch(
      `${baseUrl}/api/stats/visitors?siteId=${siteId}&period=${period}`,
      { 
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );
    const visitorsData = visitorsRes.ok ? await visitorsRes.json() : { total: 0 };

    const pageviewsRes = await fetch(
      `${baseUrl}/api/stats/pageviews?siteId=${siteId}&period=${period}`,
      { 
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );
    const pageviewsData = pageviewsRes.ok ? await pageviewsRes.json() : { total: 0 };

    // ページ統計を取得
    const pagesRes = await fetch(
      `${baseUrl}/api/stats/pages?siteId=${siteId}&period=${period}&limit=10`,
      { 
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );
    const pagesData = pagesRes.ok ? await pagesRes.json() : { pages: [] };

    // デバイス統計を取得
    const devicesRes = await fetch(
      `${baseUrl}/api/stats/devices?siteId=${siteId}&period=${period}`,
      { 
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );
    const devicesData = devicesRes.ok ? await devicesRes.json() : { mobile: 0, desktop: 0, tablet: 0 };

    // 流入元統計を取得
    const sourcesRes = await fetch(
      `${baseUrl}/api/stats/sources?siteId=${siteId}&period=${period}`,
      { 
        cache: "no-store",
        headers: {
          cookie: cookieHeader,
        },
      }
    );
    const sourcesData = sourcesRes.ok ? await sourcesRes.json() : { sources: [] };

    // 直帰率とセッション時間を計算（簡易版）
    const totalEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(and(eq(events.siteId, siteId), gte(events.timestamp, startDate)));

    const totalEventCount = totalEvents[0]?.count || 0;
    const avgBounceRate = totalEventCount > 0 ? 45 : 0; // 簡易計算
    const avgSessionDuration = totalEventCount > 0 ? 120 : 0; // 簡易計算

    // モバイル直帰率を計算
    const mobileEvents = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)
      .where(
        and(
          eq(events.siteId, siteId),
          gte(events.timestamp, startDate),
          eq(events.deviceType, 'mobile')
        )
      );

    const mobileEventCount = mobileEvents[0]?.count || 0;
    const mobileBounce = mobileEventCount > 0 ? (mobileEventCount / totalEventCount) * 100 : 0;

    // Gemini APIを使用してAI分析を実行
    try {
      // GSCデータを取得（連携時）
      let gscDataForAI = undefined;
      if (site.gscEnabled && site.gscConfig) {
        try {
          const gscRes = await fetch(
            `${baseUrl}/api/gsc/stats?siteId=${siteId}&period=${period}`,
            { 
              cache: "no-store",
              headers: {
                cookie: cookieHeader,
              },
            }
          );
          if (gscRes.ok) {
            const gscData = await gscRes.json();
            gscDataForAI = {
              clicks: gscData.summary?.clicks || 0,
              impressions: gscData.summary?.impressions || 0,
              ctr: gscData.summary?.ctr || 0,
              position: gscData.summary?.position || 0,
              topQueries: gscData.queries?.slice(0, 5).map((q: any) => ({
                query: q.keys[0] || "",
                clicks: q.clicks || 0,
                impressions: q.impressions || 0,
                ctr: q.ctr ? q.ctr * 100 : 0,
                position: q.position || 0,
              })),
            };
          }
        } catch (error) {
          console.error("GSC data fetch for AI error:", error);
        }
      }

      // AI分析用データを構築
      const analyticsData = {
        totalVisitors: visitorsData.total || 0,
        totalPageviews: pageviewsData.total || 0,
        avgBounceRate,
        avgSessionDuration,
        topPages: (pagesData.pages || []).map((p: any) => ({
          path: p.path || "",
          pageviews: p.pageviews || 0,
          bounceRate: 45, // 簡易値
        })),
        topSources: (sourcesData.sources || []).map((s: any) => ({
          source: s.source || "",
          visitors: s.visitors || 0,
        })),
        deviceBreakdown: {
          mobile: devicesData.mobile || 0,
          desktop: devicesData.desktop || 0,
          tablet: devicesData.tablet || 0,
        },
        gscData: gscDataForAI,
      };

      // Gemini APIでAI分析を実行
      const aiInsights = await generateAIInsights(analyticsData);

      if (aiInsights.length > 0) {
        // SEOカテゴリを優先
        const seoInsights = aiInsights.filter((i) => i.category === "SEO");
        const otherInsights = aiInsights.filter((i) => i.category !== "SEO");
        const sortedInsights = [...seoInsights, ...otherInsights].slice(0, 3);

        return NextResponse.json({
          insights: sortedInsights,
        });
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      // AI分析が失敗した場合はルールベースの結果を使用
    }

    // ルールベースのインサイト（フォールバック）
    if (mobileBounce > 60) {
      ruleBasedInsights.push({
        category: "UX",
        priority: "high",
        title: "モバイル直帰率が高い",
        description: `モバイルユーザーの直帰率が${mobileBounce.toFixed(1)}%と高くなっています。モバイル体験の改善が必要です。`,
        actionItems: [
          "ページの読み込み速度を最適化",
          "モバイルでの操作性を改善",
          "コンテンツの可読性を向上",
        ],
      });
    }

    if (ruleBasedInsights.length === 0) {
      ruleBasedInsights.push({
        category: "SEO",
        priority: "medium",
        title: "データ収集中",
        description: "より詳細な分析のため、しばらくデータを収集してください。",
        actionItems: ["トラッキングコードが正しく設置されているか確認", "数日後に再度分析を実行"],
      });
    }

    return NextResponse.json({
      insights: ruleBasedInsights.slice(0, 3),
    });
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

