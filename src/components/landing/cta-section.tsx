import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-9 sm:text-4xl sm:leading-10 dark:text-gray-100">
          あなたのWebサイトの分析を始めませんか？<br />
          <span className="text-indigo-600 dark:text-indigo-400">
            今すぐ無料で始めましょう。
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row mt-8 lg:shrink-0 lg:mt-0">
          <div className="inline-flex shadow-sm rounded-md">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              無料で始める
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="inline-flex ml-0 sm:ml-3 mt-3 sm:mt-0 shadow-xs rounded-md">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent leading-6 rounded-md dark:text-gray-100 dark:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

