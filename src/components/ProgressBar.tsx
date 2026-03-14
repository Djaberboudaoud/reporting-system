import { cn } from "@/lib/utils";

interface ProgressBarProps {
  completed: number;
  total: number;
  className?: string;
}

export const ProgressBar = ({ completed, total, className }: ProgressBarProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 flex-1 rounded-full bg-secondary">
        <div
          className="h-2 rounded-full gradient-cta transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        {completed}/{total}
      </span>
    </div>
  );
};
