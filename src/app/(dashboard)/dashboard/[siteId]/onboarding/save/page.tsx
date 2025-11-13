"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getOnboardingData,
  clearOnboardingData,
} from "@/lib/onboarding-storage";

export default function SaveOnboardingPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId as string;

  useEffect(() => {
    const saveSite = async () => {
      try {
        const onboardingData = getOnboardingData();
        if (!onboardingData?.domain) {
          // データがない場合はサイト登録ページにリダイレクト
          router.push("/dashboard/sites/new");
          return;
        }

        // DBにサイトを保存
        const response = await fetch("/api/sites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domain: onboardingData.domain,
            name: onboardingData.name,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "サイトの登録に失敗しました");
        }

        const data = await response.json();
        const site = data.site;

        // セッションストレージをクリア
        clearOnboardingData();

        // GSCが選択されている場合はGSC連携ページに、そうでない場合はダッシュボードにリダイレクト
        if (onboardingData.features?.gsc) {
          router.push(`/dashboard/${site.id}/connect/gsc`);
        } else {
          router.push(`/dashboard/${site.id}?onboarding=completed`);
        }
      } catch (err) {
        console.error("サイトの保存に失敗しました:", err);
        router.push("/dashboard/sites/new");
      }
    };

    saveSite();
  }, [router, siteId]);

  // リダイレクト中はローディング表示
  return (
    <div className="container print:max-w-full">
      <div className="pt-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              サイトを登録中...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

