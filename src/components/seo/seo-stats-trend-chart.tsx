"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface SEOStatsTrendChartProps {
  siteId: string;
}

interface DailyRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

type ComparePeriod = "1d" | "7d" | "30d";

export function SEOStatsTrendChart({ siteId }: SEOStatsTrendChartProps) {
  const [data, setData] = useState<
    Array<{ date: string; dateFull: string; position: number | null }>
  >([]);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);
  const [currentDelta, setCurrentDelta] = useState<number | null>(null);
  const [comparePeriod, setComparePeriod] = useState<ComparePeriod>("1d");
  const [loading, setLoading] = useState(true);
  const [hasMissingData, setHasMissingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/gsc/stats?siteId=${siteId}&period=30d`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const result = await response.json();

        // 日別データを整形（平均順位のみ）
        const chartData = (result.daily || [])
          .filter((row: DailyRow) => row.keys && row.keys.length > 0)
          .map((row: DailyRow) => {
            const dateStr = row.keys?.[0] || "";
            const date = new Date(dateStr);
            const formattedDate = dateStr
              ? `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
                  .getDate()
                  .toString()
                  .padStart(2, "0")}`
              : "";
            const positionValue =
              row.position && row.position > 0
                ? Number(row.position.toFixed(1))
                : null;
            return {
              date: formattedDate,
              dateFull: dateStr, // ソート用に元の日付を保持
              position: positionValue,
            };
          })
          .sort(
            (
              a: { date: string; dateFull: string; position: number | null },
              b: { date: string; dateFull: string; position: number | null }
            ) => {
              // 元の日付文字列（YYYY-MM-DD）でソート
              return a.dateFull.localeCompare(b.dateFull);
            }
          );

        // 最新日の平均順位を表示（データがない場合はsummaryを使用）
        if (chartData.length > 0) {
          const latestWithValue = [...chartData]
            .reverse()
            .find(
              (item) => item.position !== null && item.position !== undefined
            );

          if (
            latestWithValue?.position !== undefined &&
            latestWithValue.position !== null
          ) {
            setCurrentPosition(Number(latestWithValue.position.toFixed(1)));
          } else if (result.summary?.position !== undefined) {
            setCurrentPosition(Number(result.summary.position.toFixed(1)));
          } else {
            setCurrentPosition(null);
          }
        } else if (result.summary?.position !== undefined) {
          setCurrentPosition(Number(result.summary.position.toFixed(1)));
        } else {
          setCurrentPosition(null);
        }

        setData(chartData);
        setHasMissingData(chartData.some((item: { date: string; dateFull: string; position: number | null }) => item.position === null));
      } catch (error) {
        console.error("Failed to fetch SEO trend data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  // 比較期間に応じてデルタを計算
  useEffect(() => {
    if (data.length === 0 || currentPosition === null) {
      setCurrentDelta(null);
      return;
    }

    const latestWithValue = [...data]
      .reverse()
      .find((item) => item.position !== null && item.position !== undefined);

    if (!latestWithValue || latestWithValue.position === null) {
      setCurrentDelta(null);
      return;
    }

    const latestDate = new Date(latestWithValue.dateFull);
    const daysToCompare =
      comparePeriod === "1d" ? 1 : comparePeriod === "7d" ? 7 : 30;
    const compareDate = new Date(latestDate);
    compareDate.setDate(compareDate.getDate() - daysToCompare);
    const compareDateStr = compareDate.toISOString().split("T")[0];

    // 比較日のデータを検索（完全一致または最も近い日）
    let compareItem = data.find(
      (item) => item.dateFull === compareDateStr && item.position !== null
    );

    // 完全一致がない場合、比較日付に最も近いデータを探す（±3日以内）
    if (!compareItem) {
      const compareDateTimestamp = compareDate.getTime();
      const candidates = data
        .filter((item) => item.position !== null)
        .map((item) => {
          const itemDate = new Date(item.dateFull);
          const diff = Math.abs(itemDate.getTime() - compareDateTimestamp);
          return { item, diff };
        })
        .filter((c) => c.diff <= 3 * 24 * 60 * 60 * 1000) // ±3日以内
        .sort((a, b) => a.diff - b.diff);

      if (candidates.length > 0) {
        compareItem = candidates[0].item;
      }
    }

    if (compareItem && compareItem.position !== null) {
      const delta = latestWithValue.position - compareItem.position;
      setCurrentDelta(Number(delta.toFixed(1)));
    } else {
      setCurrentDelta(null);
    }
  }, [data, currentPosition, comparePeriod]);

  // データ範囲を計算（Y軸スケール調整用）
  const positions = data
    .filter((d) => typeof d.position === "number")
    .map((d) => d.position as number);
  const minPosition =
    positions.length > 0 ? Math.floor(Math.min(...positions) - 2) : 0;
  const maxPosition =
    positions.length > 0 ? Math.ceil(Math.max(...positions) + 2) : 20;
  const yDomain: [number, number] = [
    Math.max(0, minPosition),
    Math.max(Math.max(0, minPosition) + 5, maxPosition),
  ];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          1ヶ月の推移
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          データがありません
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              1ヶ月の推移
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              サイト全体の平均順位の推移
            </p>
            {hasMissingData && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                ※ 一部の日でGSCデータが欠損しているため線が途切れています
              </p>
            )}
          </div>
          {currentPosition !== null && (
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                最新の平均掲載順位
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {currentPosition}位
              </div>
              {currentDelta !== null && currentDelta !== 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    {currentDelta < 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        currentDelta < 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {comparePeriod === "1d"
                        ? "前日比"
                        : comparePeriod === "7d"
                        ? "前週比"
                        : "前月比"}{" "}
                      順位{currentDelta < 0 ? "改善" : "悪化"}{" "}
                      {Math.abs(currentDelta).toFixed(1)}位
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setComparePeriod("1d")}
                      className={`px-2 py-0.5 text-[10px] rounded ${
                        comparePeriod === "1d"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      前日
                    </button>
                    <button
                      onClick={() => setComparePeriod("7d")}
                      className={`px-2 py-0.5 text-[10px] rounded ${
                        comparePeriod === "7d"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      前週
                    </button>
                    <button
                      onClick={() => setComparePeriod("30d")}
                      className={`px-2 py-0.5 text-[10px] rounded ${
                        comparePeriod === "30d"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      前月
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            stroke="#9ca3af"
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11 }}
            stroke="#9ca3af"
            label={{
              value: "平均順位",
              angle: -90,
              position: "insideLeft",
              fill: "#6b7280",
              fontSize: 11,
            }}
            reversed={true}
            domain={yDomain}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "8px",
              fontSize: "12px",
            }}
            labelStyle={{
              fontWeight: "bold",
              marginBottom: "4px",
              fontSize: "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="position"
            stroke="#10b981"
            strokeWidth={2}
            fill="#10b981"
            fillOpacity={0.08}
            name="平均順位"
            connectNulls={false}
            isAnimationActive={false}
            baseValue="dataMax" // Y軸が反転しているため、dataMaxを基準に下側を塗りつぶす
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
