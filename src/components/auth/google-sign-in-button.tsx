"use client";

import { useState } from "react";

interface GoogleSignInButtonProps {
  text: string;
}

export function GoogleSignInButton({ text }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // callbackURLは指定しない（config.tsのafterSignInコールバックで制御）
      const response = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          provider: "google",
        }),
      });

      const data = await response.json();
      
      // デバッグ: OAuthリクエストURLをログに出力
      if (data.url) {
        console.log("🔍 OAuthリクエストURL:", data.url);
        // URLからスコープパラメータを抽出
        const urlObj = new URL(data.url);
        const scopeParam = urlObj.searchParams.get("scope");
        console.log("🔍 リクエストされているスコープ:", scopeParam);
        if (scopeParam && !scopeParam.includes("webmasters.readonly")) {
          console.warn("⚠️ webmasters.readonlyスコープが含まれていません！");
        }
      }
      
      if (data.url && data.redirect) {
        // Better Authが返したURLにリダイレクト
        window.location.href = data.url;
      } else {
        console.error("リダイレクトURLが取得できませんでした", data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Googleログインエラー:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      {isLoading ? "処理中..." : text}
    </button>
  );
}

