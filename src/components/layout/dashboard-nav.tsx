"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
}

interface SiteInfo {
  id: string;
  name: string | null;
  domain: string;
  gscEnabled: boolean | null;
}

interface DashboardNavProps {
  user: UserInfo | null;
  sites: SiteInfo[];
}

export function DashboardNav({ user, sites }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const siteMenuRef = useRef<HTMLDivElement>(null);

  // 現在のサイトIDを取得（URLから）
  const currentSiteId = pathname?.match(/\/dashboard\/([^\/]+)/)?.[1];
  const currentSite = sites.find((s) => s.id === currentSiteId);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
        setIsSiteMenuOpen(false);
      }
    };

    if (isMenuOpen || isSiteMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, isSiteMenuOpen]);

  const handleLogout = async () => {
    try {
      // カスタムログアウトエンドポイントを呼び出す
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // レスポンスを確認（エラーでもログインページにリダイレクト）
      if (response.ok) {
        const data = await response.json();
        console.log("ログアウト成功:", data.message);
      }

      // ログインページにリダイレクト
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("ログアウトエラー:", error);
      // エラーが発生してもログインページにリダイレクト
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="relative z-20 py-8">
      <div className="container print:max-w-full">
        <nav className="relative flex items-center justify-between sm:h-10 md:justify-center">
          <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0 gap-4">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
            >
              Coffee Analytics
            </Link>
            {/* サイト選択ドロップダウン */}
            {user && sites.length > 0 && currentSiteId && (
              <div className="relative" ref={siteMenuRef}>
                <button
                  onClick={() => setIsSiteMenuOpen(!isSiteMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <span className="truncate max-w-[200px]">
                    {currentSite?.name || currentSite?.domain || "サイトを選択"}
                  </span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </button>

                {isSiteMenuOpen && (
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 max-h-96 overflow-y-auto">
                    {sites.map((site) => (
                      <Link
                        key={site.id}
                        href={`/dashboard/${site.id}`}
                        onClick={() => setIsSiteMenuOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          site.id === currentSiteId
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {site.name || site.domain}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {site.domain}
                            </p>
                          </div>
                          {site.gscEnabled && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              GSC
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <Link
                        href="/dashboard/sites/new"
                        onClick={() => setIsSiteMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                      >
                        + 新しいサイトを追加
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center justify-end">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.[0]?.toUpperCase() ||
                          user.email[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.name || "ユーザー"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <ul className="flex">
                <li>
                  <div className="inline-flex">
                    <Link
                      href="/login"
                      className="font-medium text-gray-500 dark:text-gray-200 hover:text-gray-900 focus:outline-hidden focus:text-gray-900 transition duration-150 ease-in-out"
                    >
                      ログイン
                    </Link>
                  </div>
                  <div className="inline-flex ml-6 rounded-sm shadow-sm">
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center px-5 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-hidden focus:ring transition duration-150 ease-in-out"
                    >
                      サインアップ
                    </Link>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </nav>
      </div>
    </nav>
  );
}
