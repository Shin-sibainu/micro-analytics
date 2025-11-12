"use client";

import Link from "next/link";

export function DashboardNav() {
  return (
    <nav className="relative z-20 py-8">
      <div className="container print:max-w-full">
        <nav className="relative flex items-center justify-between sm:h-10 md:justify-center">
          <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100"
            >
              Coffee Analytics
            </Link>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center justify-end">
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
          </div>
        </nav>
      </div>
    </nav>
  );
}
