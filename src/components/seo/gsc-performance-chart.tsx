"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GSCPerformanceChartProps {
  siteId: string;
  period?: "7d" | "30d" | "90d";
}

interface DailyRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function GSCPerformanceChart({ siteId, period = "7d" }: GSCPerformanceChartProps) {
  const [data, setData] = useState<Array<{ date: string; dateFull: string; clicks: number; impressions: number; ctr: number; position: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/gsc/stats?siteId=${siteId}&period=${period}`);
        if (!response.ok) {
          throw new Error("データの取得に失敗しました");
        }
        const result = await response.json();
        
        // 日別データを整形
        const chartData = (result.daily || [])
          .filter((row: DailyRow) => row.keys && row.keys.length > 0) // keysが存在することを確認
          .map((row: DailyRow) => {
            const dateStr = row.keys?.[0] || "";
            // 日付をMM/DD形式に変換
            const date = new Date(dateStr);
            const formattedDate = dateStr ? `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}` : "";
            return {
              date: formattedDate,
              dateFull: dateStr,
              clicks: row.clicks || 0,
              impressions: row.impressions || 0,
              ctr: Number(((row.ctr || 0) * 100).toFixed(2)),
              position: Number((row.position || 0).toFixed(1)),
            };
          })
          .sort((a: { date: string; dateFull: string; clicks: number; impressions: number; ctr: number; position: number }, b: { date: string; dateFull: string; clicks: number; impressions: number; ctr: number; position: number }) => a.dateFull.localeCompare(b.dateFull)); // 日付順にソート

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch GSC performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [siteId, period]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          パフォーマンス推移
        </h3>
        <p className="text-gray-600 dark:text-gray-400">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        パフォーマンス推移
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            yAxisId="left"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            label={{ value: 'クリック数・インプレッション', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            stroke="#9ca3af"
            label={{ value: 'CTR (%)・平均ポジション', angle: 90, position: 'insideRight', fill: '#6b7280' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="clicks" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="クリック数"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="impressions" 
            stroke="#10b981" 
            strokeWidth={3}
            name="インプレッション"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="ctr" 
            stroke="#f59e0b" 
            strokeWidth={3}
            name="CTR (%)"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="position" 
            stroke="#ef4444" 
            strokeWidth={3}
            name="平均ポジション"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

