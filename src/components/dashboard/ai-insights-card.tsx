"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface AIInsightsCardProps {
  siteId: string;
  period?: string;
}

interface Insight {
  category: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems: string[];
}

export function AIInsightsCard({ siteId, period = "7d" }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/insights?siteId=${siteId}&period=${period}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const data = await response.json();
      setInsights(data.insights || []);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasAnalyzed && !loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              SEO改善のアクション
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AIがサイトを分析して改善ポイントを提案します
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          AI分析を実行して、改善すべきポイントを確認しましょう
        </p>
        <button
          onClick={fetchInsights}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          AI分析を実行
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              SEO改善のアクション
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AIがサイトを分析中...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              SEO改善のアクション
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AIがサイトを分析して改善ポイントを提案します
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          分析結果が見つかりませんでした。しばらくしてから再度お試しください。
        </p>
        <button
          onClick={fetchInsights}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          再分析
        </button>
      </div>
    );
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
  };

  const priorityLabels = {
    high: "優先度: 高",
    medium: "優先度: 中",
    low: "優先度: 低",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              SEO改善のアクション
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              次に取り組むべき改善ポイント
            </p>
          </div>
        </div>
        <button
          onClick={fetchInsights}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          再分析
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[insight.priority]}`}
                >
                  {priorityLabels[insight.priority]}
                </span>
                {insight.category === "SEO" && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200 rounded text-xs font-medium">
                    SEO
                  </span>
                )}
              </div>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {insight.title}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              {insight.description}
            </p>
            {insight.actionItems && insight.actionItems.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  具体的なアクション:
                </p>
                <ul className="space-y-1.5">
                  {insight.actionItems.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

