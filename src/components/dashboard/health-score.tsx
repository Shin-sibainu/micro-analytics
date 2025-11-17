"use client";

import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

interface HealthScoreProps {
  siteId: string;
  period?: string;
  initialSummary?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  } | null;
}

interface SEOScoreMetrics {
  avgPosition: number; // 平均検索順位
  avgCTR: number; // 平均CTR (%)
  clicks: number; // クリック数
  clicksChange: number; // クリック数の前週比 (%)
  seoScore: number; // SEOスコア (0-100)
  previousScore?: number;
}

export function HealthScore({ siteId, period = "7d", initialSummary }: HealthScoreProps) {
  const [metrics, setMetrics] = useState<SEOScoreMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateSEOScore = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

        let gscData = initialSummary;

        if (!gscData) {
          // GSCデータを取得
          const gscRes = await fetch(
            `${baseUrl}/api/gsc/stats?siteId=${siteId}&period=${period}`,
            { cache: "no-store", credentials: 'include' }
          );

          if (!gscRes.ok) {
            // GSC未連携の場合はデフォルト値を設定
            setMetrics({
              avgPosition: 0,
              avgCTR: 0,
              clicks: 0,
              clicksChange: 0,
              seoScore: 0,
            });
            setLoading(false);
            return;
          }
          gscData = await gscRes.json().then((data) => data.summary);
        }

        if (!gscData) {
          setMetrics({
            avgPosition: 0,
            avgCTR: 0,
            clicks: 0,
            clicksChange: 0,
            seoScore: 0,
          });
          setLoading(false);
          return;
        }

        const avgCTR = gscData.ctr || 0;
        const avgPosition = gscData.position || 0;
        const currentClicks = gscData.clicks || 0;

        // 前週のデータを取得（比較用）
        const prevDays = period === "7d" ? 14 : period === "30d" ? 60 : 180;
        const prevGscRes = await fetch(
          `${baseUrl}/api/gsc/stats?siteId=${siteId}&period=${prevDays}d`,
          { cache: "no-store", credentials: 'include' }
        );

        let prevClicks = 0;
        let prevScore = 0;
        if (prevGscRes.ok) {
          const prevGscData = await prevGscRes.json();
          const prevClicksTotal = prevGscData.summary?.clicks || 0;
          // prevClicksは現在の期間のクリック数を含まないように調整
          prevClicks = prevClicksTotal - currentClicks;

          // 前週のスコアを計算（同じ計算式を使用）
          const prevAvgCTR = prevGscData.summary?.ctr || 0;
          const prevAvgPosition = prevGscData.summary?.position || 0;
          
          let prevCtrScore = 0;
          if (prevAvgCTR >= 2) {
            prevCtrScore = 100;
          } else if (prevAvgCTR > 0) {
            prevCtrScore = (prevAvgCTR / 2) * 100;
          }
          
          let prevPositionScore = 0;
          if (prevAvgPosition <= 1) {
            prevPositionScore = 100;
          } else if (prevAvgPosition <= 10) {
            prevPositionScore = 100 - ((prevAvgPosition - 1) / 9) * 50;
          } else if (prevAvgPosition <= 20) {
            prevPositionScore = 50 - ((prevAvgPosition - 10) / 10) * 50;
          }
          
          prevScore = (prevPositionScore * 0.6) + (prevCtrScore * 0.4);
        }

        // クリック数の前週比を計算
        const clicksChange =
          prevClicks > 0 ? ((currentClicks - prevClicks) / prevClicks) * 100 : 0;

        // SEOスコアを計算
        // CTRスコア（目標2%以上を基準に計算）
        // 2%以上: 100点、1%: 50点、0%: 0点の線形スケール
        let ctrScore = 0;
        if (avgCTR >= 2) {
          // 2%以上は100点（最大5%で100点を維持）
          ctrScore = 100;
        } else if (avgCTR > 0) {
          // 0-2%の間は線形にスケール（2%で100点、0点）
          ctrScore = (avgCTR / 2) * 100;
        }
        
        // 順位スコア（目標10位以内を基準に計算）
        // 1位: 100点、10位: 50点、20位: 0点の線形スケール
        let positionScore = 0;
        if (avgPosition <= 1) {
          positionScore = 100;
        } else if (avgPosition <= 10) {
          // 1-10位の間: 100点から50点まで線形に減少
          positionScore = 100 - ((avgPosition - 1) / 9) * 50;
        } else if (avgPosition <= 20) {
          // 10-20位の間: 50点から0点まで線形に減少
          positionScore = 50 - ((avgPosition - 10) / 10) * 50;
        }
        // 20位より下は0点
        
        // 最終スコア: CTRと順位の平均（重み付け: 順位60%、CTR40%）
        // 順位の方が重要なので重み付けを調整
        const seoScore = (positionScore * 0.6) + (ctrScore * 0.4);

        setMetrics({
          avgPosition: Number(avgPosition.toFixed(1)),
          avgCTR: Number(avgCTR.toFixed(2)),
          clicks: currentClicks,
          clicksChange: Number(clicksChange.toFixed(1)),
          seoScore: Math.round(seoScore),
          previousScore: Math.round(prevScore),
        });
      } catch (error) {
        console.error("SEO score calculation error:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateSEOScore();
  }, [siteId, period, initialSummary]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 w-full">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (!metrics || metrics.seoScore === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 w-full">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            SEOスコア
          </h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          GSC連携が必要です
        </p>
      </div>
    );
  }

  const scoreColor =
    metrics.seoScore >= 80
      ? "text-green-600 dark:text-green-400"
      : metrics.seoScore >= 60
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";

  const scoreBgColor =
    metrics.seoScore >= 80
      ? "bg-green-100 dark:bg-green-900/20"
      : metrics.seoScore >= 60
      ? "bg-yellow-100 dark:bg-yellow-900/20"
      : "bg-red-100 dark:bg-red-900/20";

  const scoreChange =
    metrics.previousScore !== undefined
      ? metrics.seoScore - metrics.previousScore
      : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 w-full">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Search className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <div className="text-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            SEOスコア
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            サイトのSEO状態
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center mb-3">
        <div className={`${scoreBgColor} rounded-full p-4 flex items-center justify-center mb-2`}>
          <div className="text-center">
            <div className={`text-3xl font-bold ${scoreColor} mb-0.5`}>
              {metrics.seoScore}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">/ 100</div>
          </div>
        </div>

        {metrics.previousScore !== undefined && scoreChange !== 0 && (
          <div className="flex items-center gap-2">
            {scoreChange > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">前週比</div>
              <span
                className={`text-sm font-semibold ${
                  scoreChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {scoreChange > 0 ? "+" : ""}
                {scoreChange}点
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">検索順位</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {metrics.avgPosition}位
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              （目標: 10位以内）
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">CTR（クリック率）</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {metrics.avgCTR}%
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              （目標: 2%以上）
            </span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">クリック数</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {metrics.clicks.toLocaleString()}
            </span>
            {metrics.clicksChange !== 0 && (
              <span
                className={`text-xs font-medium ${
                  metrics.clicksChange > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {metrics.clicksChange > 0 ? "+" : ""}
                {metrics.clicksChange}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

