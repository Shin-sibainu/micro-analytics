"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveOnboardingData,
  getOnboardingData,
  generateTempSiteId,
} from "@/lib/onboarding-storage";

export function SiteRegistrationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    domain: "",
    name: "",
  });

  // セッションストレージから既存データを読み込む
  useEffect(() => {
    const existing = getOnboardingData();
    if (existing) {
      setFormData({
        domain: existing.domain || "",
        name: existing.name || "",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const domain = formData.domain.trim();
      const name = formData.name.trim() || domain;

      if (!domain) {
        throw new Error("ドメインは必須です");
      }

      // セッションストレージに一時保存（DBには保存しない）
      saveOnboardingData({
        domain,
        name,
        features: {
          basicTracking: true,
          gsc: false,
          ga4: false,
        },
      });

      // 一時的なIDを生成して機能選択画面にリダイレクト
      const tempSiteId = generateTempSiteId();
      router.push(`/dashboard/${tempSiteId}/onboarding`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          ドメイン <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="domain"
          required
          value={formData.domain}
          onChange={(e) =>
            setFormData({ ...formData, domain: e.target.value })
          }
          placeholder="example.com"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          プロトコル（https://）は不要です。例: example.com
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          サイト名（オプション）
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="マイサイト"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          未入力の場合はドメイン名が使用されます
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? "登録中..." : "サイトを追加"}
        </button>
      </div>
    </form>
  );
}

