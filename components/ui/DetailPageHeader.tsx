import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function DetailPageHeader({
  title,
  subtitle,
  badge,
  actions,
  onBack,
  showBackButton = true,
  className = "",
}: DetailPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            type="button"
            onClick={handleBack}
            className="h-10 w-10 rounded-full border border-[#1f2937] bg-[#111827]/50 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default DetailPageHeader;
