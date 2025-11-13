"use client";

import { useEffect, useState } from "react";
import { FeatureSelectionForm } from "./feature-selection-form";
import { getOnboardingData } from "@/lib/onboarding-storage";

interface OnboardingDataDisplayProps {
  siteId: string;
}

export function OnboardingDataDisplay({ siteId }: OnboardingDataDisplayProps) {
  const [onboardingData, setOnboardingData] = useState<{
    domain: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const data = getOnboardingData();
    if (data) {
      setOnboardingData({
        domain: data.domain,
        name: data.name,
      });
    }
  }, []);

  if (!onboardingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          データが見つかりません。最初からやり直してください。
        </p>
      </div>
    );
  }

  return <FeatureSelectionForm siteId={siteId} domain={onboardingData.domain} />;
}

