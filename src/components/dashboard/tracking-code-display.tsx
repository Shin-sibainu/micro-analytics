"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TrackingCodeDisplayProps {
  trackingId: string;
  domain: string;
  siteId?: string;
  showNextStep?: boolean;
  nextStepPath?: string;
  nextStepLabel?: string;
  onNextStep?: () => void;
  trackingServerUrl?: string;
}

export function TrackingCodeDisplay({
  trackingId,
  domain,
  siteId,
  showNextStep = false,
  nextStepPath,
  nextStepLabel = "次へ",
  onNextStep,
  trackingServerUrl,
}: TrackingCodeDisplayProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // トラッキングサーバーのURLを取得（プロップを優先、なければ環境変数、最後にwindow.location.origin）
  const serverUrl = trackingServerUrl || 
    (typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_TRACKING_URL || window.location.origin)
      : process.env.NEXT_PUBLIC_TRACKING_URL || 'http://localhost:3000');
  
  // シンプルな1つのscriptタグのみ
  const trackingCode = `<script async src="${serverUrl}/js/ca-${trackingId}.js"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  const handleNextStep = () => {
    if (onNextStep) {
      onNextStep();
    } else if (nextStepPath) {
      router.push(nextStepPath);
    } else if (siteId) {
      router.push(`/dashboard/${siteId}`);
    }
  };

  // ボタンコンポーネントを返す（オプション）
  const NextStepButton = showNextStep ? (
    <div className="mt-6 flex items-center justify-end">
      <button
        onClick={handleNextStep}
        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {nextStepLabel}
      </button>
    </div>
  ) : null;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          トラッキングコード
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          以下のコードをあなたのサイトの
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
            &lt;head&gt;
          </code>
          タグ内に追加してください
        </p>
      </div>

      <div className="relative">
        <pre className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-4 overflow-x-auto">
          <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
            {trackingCode}
          </code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {copied ? "コピーしました！" : "コピー"}
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>次のステップ:</strong> コードを追加したら、「設置確認へ」ボタンをクリックして設置状態を確認してください。
        </p>
      </div>

      <div className="mt-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            主要CMS別の設置ガイドを見る
          </summary>
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                WordPress
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                テーマの
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  header.php
                </code>
                の
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  &lt;/head&gt;
                </code>
                の直前に追加するか、プラグイン（例: Insert Headers and Footers）を使用してください。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Next.js
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  app/layout.tsx
                </code>
                または
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  pages/_document.tsx
                </code>
                の
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  &lt;head&gt;
                </code>
                セクションに追加してください。
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                その他のサイト
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                すべてのページの
                <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                  &lt;head&gt;
                </code>
                タグ内に追加してください。
              </p>
            </div>
          </div>
        </details>
      </div>
      </div>
      {NextStepButton}
    </>
  );
}

