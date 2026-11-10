import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { tokens } from '../../tokens';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-[6px] bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
      <div className="w-10 h-10 rounded-[6px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-500">
        <Icon size={18} />
      </div>

      <div className="max-w-sm mx-auto space-y-1">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-1">
          <button
            onClick={onAction}
            className={tokens.components.buttonSecondary}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
