import { requireAuth } from "@/lib/auth/guard";
import { OnboardingProgress } from "@/components/dashboard/onboarding-progress";
import { OnboardingDataDisplay } from "@/components/dashboard/onboarding-data-display";

interface OnboardingPageProps {
  params: Promise<{
    siteId: string;
  }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  await requireAuth();
  const { siteId } = await params;

  return (
    <div className="container print:max-w-full">
      <div className="pt-6 max-w-2xl mx-auto">
        <OnboardingProgress currentStep="features" siteId={siteId} />
        <OnboardingDataDisplay siteId={siteId} />
      </div>
    </div>
  );
}

