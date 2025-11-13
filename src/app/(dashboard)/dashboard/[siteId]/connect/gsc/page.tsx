import { requireAuthAndSiteAccess } from "@/lib/auth/guard";
import { GSCConnectionForm } from "@/components/dashboard/gsc-connection-form";
import { OnboardingProgress } from "@/components/dashboard/onboarding-progress";

interface GSCConnectionPageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export default async function GSCConnectionPage({
  params,
}: GSCConnectionPageProps) {
  const { siteId } = await params;
  
  // 一時的なIDの場合は、保存ページにリダイレクト
  if (siteId.startsWith("temp_")) {
    return (
      <div className="container print:max-w-full">
        <div className="pt-6 max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
              サイトを先に保存してください
            </h2>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
              GSC連携を行うには、まずサイトを保存する必要があります。
            </p>
            <a
              href={`/dashboard/${siteId}/onboarding/save`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              サイトを保存する
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  const { site } = await requireAuthAndSiteAccess(siteId);

  // 既にGSC連携済みの場合はダッシュボードにリダイレクト
  if (site.gscEnabled) {
    return (
      <div className="container print:max-w-full">
        <div className="pt-6 max-w-2xl mx-auto">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Google Search Console連携済み
            </h2>
            <p className="text-sm text-green-800 dark:text-green-200 mb-4">
              このサイトは既にGoogle Search Consoleと連携されています。
            </p>
            <a
              href={`/dashboard/${siteId}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              ダッシュボードに戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container print:max-w-full">
      <div className="pt-6 max-w-2xl mx-auto">
        <OnboardingProgress currentStep="gsc" siteId={siteId} />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Google Search Console連携
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {site.name || site.domain} をGoogle Search Consoleと連携して、SEO分析を有効にします
          </p>
        </div>

        <GSCConnectionForm siteId={siteId} domain={site.domain} />
      </div>
    </div>
  );
}

