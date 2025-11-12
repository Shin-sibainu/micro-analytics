import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'エッセンシャル',
    price: '980',
    description: '個人開発者やブロガーに最適',
    features: [
      '1サイト',
      '全機能アクセス',
      '週次AI分析',
      'メールサポート',
    ],
    cta: '今すぐ始める',
    popular: false,
  },
  {
    name: 'プロフェッショナル',
    price: '1,980',
    description: '最も人気のプラン',
    features: [
      '5サイト',
      '全機能アクセス',
      '日次AI分析',
      '優先サポート',
      'API アクセス',
    ],
    cta: '今すぐ始める',
    popular: true,
  },
  {
    name: 'ビジネス',
    price: '3,980',
    description: '企業や代理店向け',
    features: [
      '無制限サイト',
      '全機能アクセス',
      'リアルタイムAI分析',
      '専用サポート',
      'ホワイトラベル対応',
    ],
    cta: 'お問い合わせ',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-850 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            シンプルな価格設定
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            年間プランなら20%OFF。最初の100名は永続30%OFF
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white dark:bg-gray-800 rounded-md border-2 p-8 ${
                plan.popular
                  ? 'border-indigo-600 dark:border-indigo-400 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    推奨
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                  ¥{plan.price}
                </span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                  /月
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                    <span className="ml-3 text-base text-gray-500 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/register"
                  className={`block w-full text-center px-5 py-3 text-base font-medium rounded-md transition duration-150 ease-in-out ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                      : 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

