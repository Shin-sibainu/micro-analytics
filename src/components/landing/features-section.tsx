import { BarChart3, Search, Database, Shield, Zap, Code } from 'lucide-react';

const features = [
  {
    name: '1分で始められる',
    description: '1行のスクリプト追加だけで、すぐに分析を開始できます。複雑な設定は不要です。',
    icon: Zap,
  },
  {
    name: '選択的機能',
    description: '基本分析、SEO分析、データ移行。必要な機能だけを選んで使えます。',
    icon: BarChart3,
  },
  {
    name: 'プライバシー重視',
    description: 'Cookie不要、GDPR準拠。ユーザーのプライバシーを最優先に設計されています。',
    icon: Shield,
  },
  {
    name: 'SEO分析',
    description: 'Google Search Console連携で、検索キーワードや順位を簡単に分析できます。',
    icon: Search,
  },
  {
    name: 'データ移行',
    description: 'GA4の過去データをインポートして、スムーズに移行できます。',
    icon: Database,
  },
  {
    name: '開発者フレンドリー',
    description: 'シンプルなAPI、カスタマイズ可能なトラッキングスクリプト。',
    icon: Code,
  },
];

export function FeaturesSection() {
  return (
    <div id="features" className="bg-white dark:bg-gray-800 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            なぜCoffee Analyticsを選ぶのか
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            シンプルさと柔軟性を両立した、次世代のWeb分析ツール
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="bg-gray-50 dark:bg-gray-850 rounded-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {feature.name}
                  </h3>
                </div>
                <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

