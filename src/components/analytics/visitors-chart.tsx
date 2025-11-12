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
  Legend,
  defs,
  linearGradient,
  stop,
} from "recharts";

interface VisitorsChartProps {
  siteId: string;
}

export function VisitorsChart({ siteId }: VisitorsChartProps) {
  const [data, setData] = useState<Array<{ date: string; visitors: number }>>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/stats/visitors?siteId=${siteId}&period=30d`
        );
        const result = await response.json();
        // 日付フォーマットを変換（YYYY-MM-DD -> M/D）
        const formattedData = (result.daily || []).map(
          (item: { date: string; visitors: number }) => {
            const date = new Date(item.date);
            return {
              date: `${date.getMonth() + 1}/${date.getDate()}`,
              visitors: item.visitors,
            };
          }
        );
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch visitors data:", error);
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
          訪問者推移（過去30日）
        </h3>
      </div>
      <div className="relative" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
              </linearGradient>
            </defs>
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
              formatter={(value: number) => [
                `${value.toLocaleString()}`,
                "訪問者数",
              ]}
            />
            <Legend display={false} />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#colorVisitors)"
              name="訪問者数"
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
