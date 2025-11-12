interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const changeColor =
    change === undefined
      ? ''
      : change >= 0
        ? 'text-green-600 dark:text-green-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </h3>
        </div>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${changeColor}`}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );
}
