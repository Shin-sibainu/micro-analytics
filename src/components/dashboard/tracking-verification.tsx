"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

interface TrackingVerificationProps {
  siteId: string;
  trackingId: string;
  domain: string;
  autoVerify?: boolean;
}

type VerificationStatus = "idle" | "verifying" | "verified" | "not_verified";

interface VerificationResult {
  verified: boolean;
  method: "events" | "html";
  message: string;
  lastEventAt?: Date;
  error?: string;
  suggestion?: string;
  debug?: {
    htmlLength?: number;
    hasDataSite?: boolean;
    hasScriptSrc?: boolean;
    foundPatterns?: string[];
  };
}

export function TrackingVerification({
  siteId,
  trackingId,
  domain,
  autoVerify = true,
}: TrackingVerificationProps) {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);

  const verify = async () => {
    setStatus("verifying");
    setResult(null);

    try {
      const response = await fetch(`/api/sites/${siteId}/verify`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
        setStatus(data.verified ? "verified" : "not_verified");
        setLastVerifiedAt(new Date());
      } else {
        setResult({
          verified: false,
          method: "html",
          message: data.error || "検証に失敗しました",
        });
        setStatus("not_verified");
      }
    } catch (error) {
      setResult({
        verified: false,
        method: "html",
        message: "検証中にエラーが発生しました",
        error: error instanceof Error ? error.message : "不明なエラー",
      });
      setStatus("not_verified");
    }
  };

  useEffect(() => {
    if (autoVerify) {
      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVerify]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          設置状態の確認
        </h3>
        <button
          onClick={verify}
          disabled={status === "verifying"}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "verifying" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              検証中...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              再検証
            </>
          )}
        </button>
      </div>

      {status === "idle" && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            トラッキングコードの設置状態を確認するには、「再検証」ボタンをクリックしてください
          </p>
        </div>
      )}

      {status === "verifying" && (
        <div className="text-center py-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            サイトを検証中...
          </p>
        </div>
      )}

      {result && (
        <div
          className={`rounded-md p-4 ${
            result.verified
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <div className="flex items-start">
            {result.verified ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            )}
            <div className="ml-3 flex-1">
              <p
                className={`text-sm font-medium ${
                  result.verified
                    ? "text-green-800 dark:text-green-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {result.message}
              </p>
              {result.method === "events" && result.lastEventAt && (
                <p className="mt-1 text-xs text-green-700 dark:text-green-300">
                  最終イベント: {new Date(result.lastEventAt).toLocaleString("ja-JP")}
                </p>
              )}
              {result.method === "html" && (
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  検証方法: HTML解析
                </p>
              )}
              {result.suggestion && (
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  {result.suggestion}
                </p>
              )}
              {result.error && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  エラー: {result.error}
                </p>
              )}
              {result.debug && !result.verified && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100">
                    デバッグ情報を表示
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono">
                    <p>HTML長: {result.debug.htmlLength} 文字</p>
                    <p>data-site属性: {result.debug.hasDataSite ? "✓" : "✗"}</p>
                    <p>ca.js参照: {result.debug.hasScriptSrc ? "✓" : "✗"}</p>
                    {result.debug.foundPatterns && result.debug.foundPatterns.length > 0 && (
                      <p>検出パターン: {result.debug.foundPatterns.join(", ")}</p>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {lastVerifiedAt && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
          最終検証: {lastVerifiedAt.toLocaleString("ja-JP")}
        </p>
      )}
    </div>
  );
}

