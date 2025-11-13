"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GSCConnectionFormProps {
  siteId: string;
  domain: string;
}

export function GSCConnectionForm({ siteId, domain }: GSCConnectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // GSC連携APIを呼び出す
      // アクセストークンはサーバー側でBetter Authのアカウント情報から取得される
      const response = await fetch("/api/connect/gsc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId,
          siteUrl: domain,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // デバッグ情報がある場合は表示
        if (data.debug) {
          console.error("GSC連携デバッグ情報:", data.debug);
        }
        
        // 再認証が必要な場合のエラーメッセージを改善
        if (data.requiresReauth) {
          let errorMessage = data.error || 
            "GSC APIにアクセスするための権限が不足しています。一度ログアウトしてから再度ログインしてください。";
          
          // デバッグ情報がある場合は追加
          if (data.debug?.currentScopes) {
            errorMessage += `\n\n現在のスコープ: ${data.debug.currentScopes || "なし"}`;
          }
          
          throw new Error(errorMessage);
        }
        
        // 404エラーの場合、デバッグ情報を表示
        if (response.status === 404 && data.debug) {
          let errorMessage = data.error || "指定されたサイトがGoogle Search Consoleに登録されていません";
          if (data.debug.availableSites && data.debug.availableSites.length > 0) {
            errorMessage += `\n\n利用可能なGSCサイト:\n${data.debug.availableSites.map((url: string) => `- ${url}`).join('\n')}`;
            errorMessage += `\n\n入力されたURL: ${data.debug.inputUrl}`;
            errorMessage += `\n\nヒント: 上記のいずれかのURL形式で入力してください。`;
          }
          throw new Error(errorMessage);
        }
        
        throw new Error(data.error || "GSC連携に失敗しました");
      }

      const data = await response.json();
      
      // 成功したらダッシュボードにリダイレクト
      router.push(`/dashboard/${siteId}?onboarding=completed`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Google Search Console連携について
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Google Search Consoleと連携することで、以下の機能が利用できるようになります：
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
          <li>検索キーワードのランキング表示</li>
          <li>CTR（クリック率）の分析</li>
          <li>検索順位の推移グラフ</li>
          <li>ページ別のSEOパフォーマンス</li>
        </ul>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
            <strong>注意:</strong> このサイトがGoogle Search Consoleに登録されている必要があります。
            まだ登録していない場合は、<a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-900 dark:hover:text-blue-100"
            >
              Google Search Console
            </a>
            でサイトを追加してください。
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            <strong>重要:</strong> GSC連携を使用するには、以下の条件が必要です：
          </p>
          <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
            <div>
              <p className="font-medium mb-1">開発者側の設定（一度だけ）:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>GCPプロジェクトで「Google Search Console API」を有効化</li>
                <li>OAuth同意画面で「https://www.googleapis.com/auth/webmasters.readonly」スコープを追加</li>
              </ol>
            </div>
            <div>
              <p className="font-medium mb-1">ユーザー側の要件:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>ログインしたGoogleアカウントが、GSCに登録されているサイトの所有者であること</li>
                <li>GCPプロジェクトの所有者である必要は<strong>ありません</strong></li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
            詳細は <code className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900 rounded">docs/gsc-troubleshooting.md</code> を参照してください。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">{error}</p>
          {error.includes("権限が不足") || error.includes("再度ログイン") ? (
            <div className="mt-3 text-sm text-red-700 dark:text-red-300">
              <p className="font-medium mb-1">解決方法:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>一度ログアウトしてください</li>
                <li>再度ログインしてください（GSC API用の権限が付与されます）</li>
                <li>その後、もう一度GSC連携を試してください</li>
              </ol>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${siteId}?onboarding=completed`)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          後で設定する
        </button>
        <button
          type="button"
          onClick={handleConnect}
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {isLoading ? "連携中..." : "Google Search Consoleと連携"}
        </button>
      </div>
    </div>
  );
}

