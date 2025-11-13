"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface TrackingStatusBadgeProps {
  siteId: string;
  domain: string;
}

export function TrackingStatusBadge({ siteId, domain }: TrackingStatusBadgeProps) {
  const [status, setStatus] = useState<"checking" | "verified" | "not_verified" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/sites/${siteId}/verify`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.verified ? "verified" : "not_verified");
        } else {
          setStatus("not_verified");
        }
      } catch {
        setStatus("not_verified");
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [siteId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>検証中...</span>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4" />
        <span>トラッキングコード設置済み</span>
      </div>
    );
  }

  if (status === "not_verified") {
    return (
      <Link
        href={`/dashboard/${siteId}/verify`}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
      >
        <AlertCircle className="h-4 w-4" />
        <span>設置確認が必要です</span>
      </Link>
    );
  }

  return null;
}

