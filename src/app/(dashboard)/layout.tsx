import { Suspense } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { getOptionalAuth } from "@/lib/auth/guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ユーザー情報を取得
  const session = await getOptionalAuth();
  const user = session?.user || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans flex flex-col">
      <DashboardNav user={user} />
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
