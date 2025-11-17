"use client";

import { useEffect, useState, useMemo } from "react";

interface GSCImprovementListProps {
  siteId: string;
  period?: "7d" | "30d" | "90d";
  limit?: number;
  initialQueries?: QueryRow[];
}

interface QueryRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface ImprovementQuery extends QueryRow {
  score: number;
  reason: string[];
}

export function GSCImprovementList({
  siteId,
  period = "7d",
  limit = 5,
  initialQueries,
}: GSCImprovementListProps) {
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentQueries: QueryRow[] = initialQueries || [];

        if (!currentQueries.length) {
          const response = await fetch(
            `/api/gsc/stats?siteId=${siteId}&period=${period}`,
            { credentials: "include" }
          );
          if (!response.ok) {
            throw new Error("データの取得に失敗しました");
          }
          const data = await response.json();
          currentQueries = data.queries || [];
        }

        setQueries(currentQueries);
      } catch (error) {
        console.error("Failed to fetch GSC queries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, period, initialQueries]);

  const improvementQueries = useMemo<ImprovementQuery[]>(() => {
    if (!queries.length) return [];

    const candidates = queries
      .map((query) => {
        const position = query.position || 0;
        const ctrPercent = (query.ctr || 0) * 100;
        const clicks = query.clicks || 0;
        const impressions = query.impressions || 0;

        const reasons: string[] = [];
        let score = 0;

        const inRankBand = position >= 8 && position <= 30;

        if (!inRankBand) {
          return null;
        }

        const expectedCTR =
          position <= 12 ? 10 : position <= 18 ? 7 : position <= 24 ? 5 : 3;
        const ctrGap = expectedCTR - ctrPercent;

        if (ctrGap > 0) {
          reasons.push(
            `CTR ${ctrPercent.toFixed(2)}%（期待${expectedCTR.toFixed(1)}%）`
          );
          score += ctrGap * 1.5;
        }

        // 順位スコア（8〜30位）
        const rankScore = Math.max(0, 32 - position);
        score += rankScore;
        reasons.push(`順位 ${position.toFixed(1)}位`);

        // クリック/インプレッションによるインパクト
        if (clicks > 0) {
          score += Math.min(clicks, 5);
        }
        if (impressions >= 30) {
          score += Math.min(Math.log10(impressions + 1) * 3, 6);
          reasons.push(`表示回数 ${impressions.toLocaleString()}件`);
        }

        return {
          ...query,
          score,
          reason: reasons,
        };
      })
      .filter((query): query is ImprovementQuery => {
        if (!query) return false;

        const ctrPercent = (query.ctr || 0) * 100;
        const clicks = query.clicks || 0;
        const impressions = query.impressions || 0;
        const position = query.position || 0;

        const meetsRank = position >= 8 && position <= 30;
        const meetsCTR =
          (position <= 15 && ctrPercent < 8) ||
          (position <= 22 && ctrPercent < 5) ||
          ctrPercent < 4;
        const hasImpact =
          clicks >= 2 ||
          impressions >= 50 ||
          (clicks === 0 && impressions >= 100);

        return (
          meetsRank &&
          meetsCTR &&
          hasImpact &&
          query.score >= 10 // スコアが低すぎるものを排除
        );
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return candidates;
  }, [queries, limit]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (improvementQueries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              改善候補（検索クエリ）
            </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            順位8〜30位 & CTRが想定値より低いクエリを表示
            </p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            改善候補は見つかりませんでした。引き続き上位キーワードを伸ばしましょう。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            改善候補（検索クエリ）
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            順位8〜20位 & CTRが5%未満のクエリを優先表示
          </p>
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {improvementQueries.length}件
        </span>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {improvementQueries.map((query, index) => (
          <div
            key={`${query.keys[0]}-${index}`}
            className="px-6 py-4 flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/40"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {query.keys[0] || "-"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {query.reason.join(" / ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  クリック {query.clicks.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  インプレッション {query.impressions.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                順位 {query.position.toFixed(1)}位
              </span>
              <span className="px-2 py-1 rounded-full bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200">
                CTR {(query.ctr * 100).toFixed(2)}%
              </span>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                クリック {query.clicks}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

