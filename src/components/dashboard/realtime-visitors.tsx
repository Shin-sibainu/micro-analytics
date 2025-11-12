'use client';

import { useEffect, useState } from 'react';

interface RealtimeVisitorsProps {
  siteId: string;
}

export function RealtimeVisitors({ siteId }: RealtimeVisitorsProps) {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await fetch(`/api/stats/realtime?siteId=${siteId}`);
        const data = await response.json();
        setVisitors(data.visitors || 0);
      } catch (error) {
        console.error('Failed to fetch realtime data:', error);
        setVisitors(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRealtimeData();
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, [siteId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            リアルタイム訪問者
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {visitors?.toLocaleString() || 0}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ライブ
          </span>
        </div>
      </div>
    </div>
  );
}
