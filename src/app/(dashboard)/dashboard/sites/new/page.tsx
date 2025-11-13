import { requireAuth } from "@/lib/auth/guard";
import { SiteRegistrationForm } from "@/components/dashboard/site-registration-form";
import { OnboardingProgress } from "@/components/dashboard/onboarding-progress";

export default async function NewSitePage() {
  await requireAuth();

  return (
    <div className="container print:max-w-full">
      <div className="pt-6 max-w-2xl mx-auto">
        <OnboardingProgress currentStep="register" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            サイトを追加
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            分析したいサイトの情報を入力してください
          </p>
        </div>

        <SiteRegistrationForm />
      </div>
    </div>
  );
}

