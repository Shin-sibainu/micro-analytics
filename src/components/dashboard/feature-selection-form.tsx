"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveOnboardingData,
  getOnboardingData,
} from "@/lib/onboarding-storage";

interface FeatureSelectionFormProps {
  siteId: string;
  domain: string;
}

export function FeatureSelectionForm({
  siteId,
  domain,
}: FeatureSelectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState({
    basicTracking: true, // 必須なので常にtrue
    gsc: false,
    ga4: false,
  });

  // セッションストレージから既存データを読み込む
  useEffect(() => {
    const existing = getOnboardingData();
    if (existing?.features) {
      setFeatures(existing.features);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // セッションストレージに機能選択を保存
      saveOnboardingData({
        features,
      });

      // 最後のステップ（保存ページ）にリダイレクト
      // ここでDBに保存される
      router.push(`/dashboard/${siteId}/onboarding/save`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Coffee Analyticsへようこそ！
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          どの機能から始めますか？
        </p>

        {/* 基本分析（必須） */}
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-md border border-indigo-200 dark:border-indigo-800">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={features.basicTracking}
              disabled
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  基本分析を始める
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                  必須
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                訪問者数、ページビュー、流入元など → 1行のスクリプト追加だけ
              </p>
            </div>
          </label>
        </div>

        {/* GSC連携（推奨） */}
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={features.gsc}
              onChange={(e) =>
                setFeatures({ ...features, gsc: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  SEO分析を追加する
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  推奨
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                検索キーワード、順位、CTRなど → Google Search Console連携
              </p>
            </div>
          </label>
        </div>

        {/* GA4連携（任意） */}
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={features.ga4}
              onChange={(e) =>
                setFeatures({ ...features, ga4: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <div className="ml-3 flex-1">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  既存データを移行する
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  任意
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                GA4の過去データをインポート → Google Analytics連携
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                ※ 現在は準備中です。後から設定できます。
              </p>
            </div>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${siteId}/onboarding/save`)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          後で設定する
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? "処理中..." : "今すぐ始める"}
        </button>
      </div>
    </form>
  );
}

