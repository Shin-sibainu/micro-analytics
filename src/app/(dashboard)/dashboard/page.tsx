import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardIndexPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  // ユーザーのサイト一覧を取得
  const userSites = await db
    .select()
    .from(sites)
    .where(eq(sites.userId, userId));

  // サイトが1つもない場合はサイト登録ページにリダイレクト
  if (userSites.length === 0) {
    redirect("/dashboard/sites/new");
  }

  // サイトが1つだけの場合はそのサイトのダッシュボードにリダイレクト
  if (userSites.length === 1) {
    redirect(`/dashboard/${userSites[0].id}`);
  }

  // 複数のサイトがある場合はサイト一覧を表示
  return (
    <div className="container print:max-w-full">
      <div className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            サイト一覧
          </h1>
          <Link
            href="/dashboard/sites/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            新しいサイトを追加
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userSites.map((site) => (
            <Link
              key={site.id}
              href={`/dashboard/${site.id}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {site.name || site.domain}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {site.domain}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  トラッキングID: {site.trackingId}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {site.trackingEnabled ? "有効" : "無効"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

