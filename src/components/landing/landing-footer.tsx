import Link from 'next/link';

const footerLinks = {
  product: [
    { name: '機能', href: '#features' },
    { name: '価格', href: '#pricing' },
    { name: '使い方', href: '#' },
  ],
  company: [
    { name: '会社概要', href: '#' },
    { name: 'ブログ', href: '#' },
    { name: 'お問い合わせ', href: '#' },
  ],
  legal: [
    { name: '利用規約', href: '#' },
    { name: 'プライバシーポリシー', href: '#' },
    { name: 'Cookieポリシー', href: '#' },
  ],
};

export function LandingFooter() {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div>
              <h3 className="text-xl font-bold text-white">Coffee Analytics</h3>
              <p className="mt-4 text-base text-gray-300">
                1分で始められる、シンプルで柔軟なWeb分析ツール
              </p>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                  製品
                </h4>
                <ul className="mt-4 space-y-4">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-base text-gray-300 hover:text-white transition-colors duration-150"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                  会社
                </h4>
                <ul className="mt-4 space-y-4">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-base text-gray-300 hover:text-white transition-colors duration-150"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase">
                  法的情報
                </h4>
                <ul className="mt-4 space-y-4">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-base text-gray-300 hover:text-white transition-colors duration-150"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Coffee Analytics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

