import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, color = 'pink' }: MetricCardProps) {
  const colorClasses = {
    pink: 'from-pink-600 to-pink-700',
    yellow: 'from-yellow-500 to-yellow-600',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses] || colorClasses.pink}`}>
          <Icon className="text-white" size={24} />
        </div>
        {trend && (
          <span className="text-sm font-semibold text-green-500">{trend}</span>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
