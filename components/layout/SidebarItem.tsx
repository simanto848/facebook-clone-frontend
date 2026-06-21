import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

export const Sidebaritem = ({
  icon: Icon,
  label,
  href,
  badge,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className="
        flex items-center justify-between
        px-4 py-3
        rounded-xl
        text-slate-300
        hover:bg-[#1f2937]
        hover:text-white
        transition
      "
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span>{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};