import { CaseStatusDB } from "@/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  open: "bg-cyan-50 text-cyan-700 border-cyan-400 dark:bg-cyan-900/30 dark:text-cyan-300",
  in_progress: "bg-amber-50 text-amber-700 border-amber-400 dark:bg-amber-900/30 dark:text-amber-300",
  closed: "bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      statusStyles[status] || "bg-gray-50 text-gray-600 border-gray-300"
    )}
  >
    {statusLabels[status] || status}
  </span>
);
