"use client";

import Link from "next/link";

interface OnboardingProgressProps {
  currentStep: "register" | "features" | "gsc";
  siteId?: string;
}

const steps = [
  {
    id: "register",
    name: "サイト登録",
    path: (siteId?: string) => "/dashboard/sites/new",
  },
  {
    id: "features",
    name: "機能選択",
    path: (siteId?: string) => `/dashboard/${siteId}/onboarding`,
  },
  {
    id: "gsc",
    name: "GSC連携",
    path: (siteId?: string) => `/dashboard/${siteId}/connect/gsc`,
  },
];

export function OnboardingProgress({
  currentStep,
  siteId,
}: OnboardingProgressProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className="mb-8">
      <nav aria-label="進捗" className="flex justify-center">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isClickable = isCompleted && siteId;

            return (
              <li key={step.id} className="flex items-center">
                <div className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`h-0.5 w-12 ${
                        isCompleted ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    {isClickable ? (
                      <Link
                        href={step.path(siteId)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                          isActive
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : isCompleted
                            ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                            : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </Link>
                    ) : (
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                    )}
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isCompleted
                          ? "text-gray-600 dark:text-gray-400"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

