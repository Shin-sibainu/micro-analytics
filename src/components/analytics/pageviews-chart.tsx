"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PageviewsChartProps {
  siteId: string;
}

export function PageviewsChart({ siteId }: PageviewsChartProps) {
  const [data, setData] = useState<Array<{ date: string; pageviews: number }>>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/stats/pageviews?siteId=${siteId}&period=30d`
        );
        const result = await response.json();
        // 日付フォーマットを変換（YYYY-MM-DD -> M/D）
        const formattedData = (result.daily || []).map((item: { date: string; pageviews: number }) => {
          const date = new Date(item.date);
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            pageviews: item.pageviews,
          };
        });
        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch pageviews data:", error);
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
          ページビュー推移（過去30日）
        </h3>
      </div>
      <div className="relative" style={{ height: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280" }}
              className="dark:text-gray-400"
              style={{ fontSize: "0.875rem" }}
            />
            <YAxis 
              tick={{ fill: "#6b7280" }} 
              className="dark:text-gray-400"
              style={{ fontSize: "0.875rem" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                padding: "12px",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                color: "#f3f4f6",
              }}
              labelStyle={{ color: "#f3f4f6" }}
            />
            <Legend display={false} />
            <Bar dataKey="pageviews" fill="#4f46e5" name="ページビュー" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

