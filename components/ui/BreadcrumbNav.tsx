import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs text-slate-400 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-blue-400 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-slate-200 truncate max-w-[200px]" : ""}>
                {item.label}
              </span>
            )}
            {!isLast && <span>/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default BreadcrumbNav;
