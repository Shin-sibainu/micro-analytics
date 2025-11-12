interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
}

export function StatsCard({ title, value, change }: StatsCardProps) {
  const trendClass =
    change === undefined
      ? ''
      : change >= 0
        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
        : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';

  const trendIcon = change !== undefined ? (change >= 0 ? '↑' : '↓') : '';

  return (
    <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</div>
      <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${trendClass}`}>
            {trendIcon} {Math.abs(change).toFixed(1)}%
          </span>
          <span>vs 前週</span>
        </div>
      )}
    </div>
  );
}
