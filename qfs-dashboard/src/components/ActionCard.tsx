import { LucideIcon } from 'lucide-react';


interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export function ActionCard({ title, description, icon: Icon, color, onClick }: ActionCardProps) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    green: { bg: 'bg-green-500/10', text: 'text-green-500' },
    red: { bg: 'bg-red-500/10', text: 'text-red-500' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl p-2 md:p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
      onClick={onClick}
    >
      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-1 md:mb-4 mx-auto md:mx-0`}>
        <Icon className={`${colors.text} w-4 h-4 md:w-6 md:h-6`} />
      </div>
      <h3 className="text-slate-900 dark:text-white text-xs md:text-xl font-semibold mb-0 md:mb-2 text-center md:text-left">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 hidden md:block">{description}</p>
    </div>
  );
}
