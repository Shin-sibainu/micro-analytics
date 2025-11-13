/**
 * オンボーディング中の一時データをセッションストレージで管理
 */

export interface OnboardingSiteData {
  domain: string;
  name: string;
  features: {
    basicTracking: boolean;
    gsc: boolean;
    ga4: boolean;
  };
}

const STORAGE_KEY = "onboarding_site_data";

/**
 * オンボーディングデータを保存
 */
export function saveOnboardingData(data: Partial<OnboardingSiteData>) {
  if (typeof window === "undefined") return;

  const existing = getOnboardingData();
  const updated = { ...existing, ...data };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * オンボーディングデータを取得
 */
export function getOnboardingData(): OnboardingSiteData | null {
  if (typeof window === "undefined") return null;

  const data = sessionStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data) as OnboardingSiteData;
  } catch {
    return null;
  }
}

/**
 * オンボーディングデータをクリア
 */
export function clearOnboardingData() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/**
 * 一時的なサイトIDを生成（URL用）
 */
export function generateTempSiteId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

