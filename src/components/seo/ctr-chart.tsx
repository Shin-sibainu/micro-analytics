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

interface CTRChartProps {
  siteId: string;
}

export function CTRChart({ siteId }: CTRChartProps) {
  const [data, setData] = useState<
    Array<{ date: string; ctr: number; clicks: number; impressions: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/seo/ctr?siteId=${siteId}&period=30d`
        );
        const result = await response.json();
        // 日付フォーマットを変換（YYYY-MM-DD -> M/D）
        const formattedData = (result.daily || []).map(
          (item: {
            date: string;
            ctr: number;
            clicks: number;
            impressions: number;
          }) => {
            const date = new Date(item.date);
            return {
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              ctr: item.ctr * 100, // パーセンテージに変換
              clicks: item.clicks,
              impressions: item.impressions,
            };
          }
        );
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch CTR data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          CTR推移（過去30日）
        </h3>
      </div>
      <div className="relative" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#374151", fontSize: "0.875rem" }}
              className="dark:text-gray-300"
            />
            <YAxis
              tick={{ fill: "#374151", fontSize: "0.875rem" }}
              className="dark:text-gray-300"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                padding: "12px",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#f3f4f6", marginBottom: "4px" }}
              itemStyle={{ color: "#ffffff", fontWeight: "600" }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, "CTR"]}
            />
            <Area
              type="monotone"
              dataKey="ctr"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="#4f46e5"
              fillOpacity={0.1}
              name="CTR"
              dot={false}
              activeDot={{
                r: 6,
                fill: "#4f46e5",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

