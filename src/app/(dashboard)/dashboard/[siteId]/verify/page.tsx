import { requireAuthAndSiteAccess } from "@/lib/auth/guard";
import { TrackingVerification } from "@/components/dashboard/tracking-verification";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

interface VerificationPageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export default async function VerificationPage({ params }: VerificationPageProps) {
  const { siteId } = await params;
  const { site } = await requireAuthAndSiteAccess(siteId);

  // データがあるか確認
  const [hasData] = await db
    .select()
    .from(events)
    .where(eq(events.siteId, siteId))
    .limit(1);

  return (
    <div className="container print:max-w-full">
      <div className="pt-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            トラッキングコードの設置確認
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {site.name || site.domain} にトラッキングコードが正しく設置されているか確認します
          </p>
        </div>

        <TrackingVerification
          siteId={siteId}
          trackingId={site.trackingId || ""}
          domain={site.domain}
          autoVerify={true}
        />

        <div className="mt-6 flex items-center justify-end space-x-4">
          <Link
            href={`/dashboard/${siteId}?onboarding=completed`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            後で設定する
          </Link>
          {!site.gscEnabled && (
            <Link
              href={`/dashboard/${siteId}/connect/gsc`}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              GSC連携を設定する
            </Link>
          )}
          {hasData && (
            <Link
              href={`/dashboard/${siteId}`}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              ダッシュボードを見る
            </Link>
          )}
          {!hasData && site.gscEnabled && (
            <Link
              href={`/dashboard/${siteId}`}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              ダッシュボードを見る
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

