"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col items-center gap-8">
          <div className="w-full text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-tight sm:text-5xl sm:leading-tight lg:text-6xl dark:text-gray-100">
              <span className="text-indigo-600 dark:text-indigo-400">
                シンプルで柔軟な
              </span>
              Web分析ツール
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              必要な機能を、必要な時に。ユーザーが自分のペースで機能を選択・拡張できる、日本発のプライバシー重視型Web分析プラットフォーム。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
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
            </div>
          </div>
          <div className="w-full max-w-4xl">
            <div className="relative w-full">
              <div className="relative rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {/* ダッシュボードのiframe */}
                <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <iframe
                    src="/dashboard/demo"
                    className="w-full h-full border-0"
                    title="ダッシュボードのデモ"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
