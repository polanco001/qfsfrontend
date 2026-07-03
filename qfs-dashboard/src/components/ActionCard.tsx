import { DivideIcon as LucideIcon } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  onClick: () => void;
}

export default function ActionCard({ title, description, icon: Icon, color, onClick }: ActionCardProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-4 md:p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-all text-left w-full"
    >
      <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-slate-100 dark:bg-slate-700'}`}>
        <Icon size={24} />
      </div>
      <div className="text-center">
        <h4 className="text-slate-900 dark:text-white font-semibold text-sm md:text-base">{title}</h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1 line-clamp-2">{description}</p>
      </div>
    </button>
  );
}
