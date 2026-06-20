import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const Sidebaritem = ({
  icon: Icon,
  label,
  href,
}: SidebarItemProps) => {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3
        px-4 py-3
        rounded-xl
        text-slate-300
        hover:bg-[#1f2937]
        hover:text-white
        transition
      "
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}