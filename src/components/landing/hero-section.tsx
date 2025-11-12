import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 leading-9 sm:text-4xl sm:leading-10 dark:text-gray-100">
              1分で始められる、<br />
              <span className="text-indigo-600 dark:text-indigo-400">シンプルで柔軟な</span><br />
              Web分析ツール
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-500 dark:text-gray-400 max-w-2xl">
              必要な機能を、必要な時に。ユーザーが自分のペースで機能を選択・拡張できる、日本発のプライバシー重視型Web分析プラットフォーム。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="inline-flex shadow-sm rounded-md">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent leading-6 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  無料で始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              <div className="inline-flex shadow-xs rounded-md">
                <Link
                  href="/dashboard/demo"
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent leading-6 rounded-md dark:text-gray-100 dark:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  デモを見る
                </Link>
              </div>
              <div className="inline-flex shadow-xs rounded-md">
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-indigo-600 bg-white border border-transparent leading-6 rounded-md dark:text-gray-100 dark:bg-gray-800 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                  機能を見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

