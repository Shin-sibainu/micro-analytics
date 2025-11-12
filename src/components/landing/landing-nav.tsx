'use client';

import Link from 'next/link';

export function LandingNav() {
  return (
    <nav className="relative z-20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="relative flex items-center justify-between sm:h-10 md:justify-center">
          <div className="flex items-center flex-1 md:absolute md:inset-y-0 md:left-0">
            <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Coffee Analytics
            </Link>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center justify-end">
            <ul className="flex items-center">
              <li>
                <Link
                  href="/dashboard/demo"
                  className="font-medium text-gray-500 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100 transition-colors duration-150 ease-in-out"
                >
                  デモ
                </Link>
              </li>
              <li className="ml-6">
                <Link
                  href="/login"
                  className="font-medium text-gray-500 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:text-gray-900 dark:focus:text-gray-100 transition-colors duration-150 ease-in-out"
                >
                  ログイン
                </Link>
              </li>
              <li className="ml-6">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 dark:hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  無料で始める
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </nav>
  );
}

