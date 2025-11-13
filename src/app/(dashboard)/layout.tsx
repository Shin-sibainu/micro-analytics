import { Suspense } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getOptionalAuth } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { sites } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ユーザー情報を取得
  const session = await getOptionalAuth();
  const user = session?.user || null;

  // ユーザーがログインしている場合はサイト一覧を取得
  let userSites: Array<{ id: string; name: string | null; domain: string; gscEnabled: boolean | null }> = [];
  if (user) {
    userSites = await db
      .select({
        id: sites.id,
        name: sites.name,
        domain: sites.domain,
        gscEnabled: sites.gscEnabled,
      })
      .from(sites)
      .where(eq(sites.userId, user.id));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col">
      <DashboardNav user={user} sites={userSites} />
      <main className="flex-1">
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
