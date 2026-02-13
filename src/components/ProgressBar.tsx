'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  sectionName?: string;
}

export default function ProgressBar({ current, total, sectionName }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-[var(--color-text-light)]">
          {sectionName ? `${sectionName}` : `진행률`}
        </span>
        <span className="text-sm font-semibold text-[var(--color-primary)]">
          {current} / {total} ({percentage}%)
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--color-primary)] progress-bar rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
