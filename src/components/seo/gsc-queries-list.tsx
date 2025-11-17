"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface GSCQueriesListProps {
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

interface QueryWithChange extends QueryRow {
  positionChange?: number;
  ctrChange?: number;
  changeScore?: number; // 変化量のスコア（並べ替え用）
}

export function GSCQueriesList({ siteId, period = "7d", limit = 10, initialQueries }: GSCQueriesListProps) {
  const [queries, setQueries] = useState<QueryWithChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentQueries: QueryRow[] = initialQueries || [];
        
        if (!currentQueries.length) {
          const response = await fetch(`/api/gsc/stats?siteId=${siteId}&period=${period}`, {
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error("データの取得に失敗しました");
          }
          const data = await response.json();
          currentQueries = data.queries || [];
        }

        // 前週のデータを取得（比較用）
        // 前週期間を計算（例：7dの場合、8日目〜14日目）
        const today = new Date();
        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(today.getDate() - (period === "7d" ? 7 : period === "30d" ? 30 : 90));
        
        const prevPeriodEnd = new Date(currentPeriodStart);
        prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1);
        const prevPeriodStart = new Date(prevPeriodEnd);
        prevPeriodStart.setDate(prevPeriodStart.getDate() - (period === "7d" ? 7 : period === "30d" ? 30 : 90));
        
        const prevPeriodStartStr = prevPeriodStart.toISOString().split("T")[0];
        const prevPeriodEndStr = prevPeriodEnd.toISOString().split("T")[0];
        
        let prevQueries: QueryRow[] = [];
        try {
          // 前週期間のクエリデータを取得
          const prevResponse = await fetch(
            `/api/gsc/stats?siteId=${siteId}&startDate=${prevPeriodStartStr}&endDate=${prevPeriodEndStr}`,
            {
              credentials: 'include',
            }
          );
          if (prevResponse.ok) {
            const prevData = await prevResponse.json();
            prevQueries = prevData.queries || [];
          }
        } catch (error) {
          console.error("Failed to fetch previous period data:", error);
        }

        // 前週比を計算
        const queriesWithChange: QueryWithChange[] = currentQueries.map((query) => {
          const queryKey = query.keys[0] || "";
          const prevQuery = prevQueries.find((pq) => pq.keys[0] === queryKey);

          let positionChange: number | undefined;
          let ctrChange: number | undefined;
          let changeScore = 0;

          if (prevQuery) {
            // 順位変動（プラスは順位が上がった、マイナスは下がった）
            // 例：前週10位 → 今週5位 = 10 - 5 = +5（順位が上がった）
            positionChange = prevQuery.position - query.position;
            // CTR変動（パーセンテージポイント）
            ctrChange = (query.ctr - prevQuery.ctr) * 100;
            
            // 変化量スコア：順位変動の絶対値 + CTR変動の絶対値 * 0.5
            // 順位変動の方が重要なので重み付け
            changeScore = Math.abs(positionChange) + Math.abs(ctrChange) * 0.5;
          }

          return {
            ...query,
            positionChange,
            ctrChange,
            changeScore,
          };
        });

        // クリック数の多い順に並べ替え
        queriesWithChange.sort((a, b) => {
          return b.clicks - a.clicks;
        });

        setQueries(queriesWithChange.slice(0, limit));
      } catch (error) {
        console.error("Failed to fetch GSC queries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, period, limit, initialQueries]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            検索クエリ
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">データがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          検索クエリ
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          上位{limit}件
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                クエリ
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                クリック
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                インプレッション
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                ポジション
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                前週比
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {queries.map((query, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {query.keys[0] || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {query.clicks.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {query.impressions.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(query.ctr * 100).toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {query.position.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {query.positionChange !== undefined || query.ctrChange !== undefined ? (
                    <div className="flex flex-col items-end gap-1 text-xs">
                      {query.positionChange !== undefined && query.positionChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {query.positionChange > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <span
                            className={
                              query.positionChange > 0
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-red-600 dark:text-red-400 font-medium"
                            }
                          >
                            順位{query.positionChange > 0 ? "改善" : "悪化"} {Math.abs(query.positionChange).toFixed(1)}
                          </span>
                        </div>
                      )}
                      {query.ctrChange !== undefined && query.ctrChange !== 0 && (
                        <div className="flex items-center gap-1">
                          {query.ctrChange > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <span
                            className={
                              query.ctrChange > 0
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-red-600 dark:text-red-400 font-medium"
                            }
                          >
                            CTR{query.ctrChange > 0 ? "改善" : "悪化"} {Math.abs(query.ctrChange).toFixed(2)}pp
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

