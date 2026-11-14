import React from "react";

export interface CategoryPillsItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

export interface CategoryPillsProps<T extends string = string> {
  categories: CategoryPillsItem<T>[];
  activeCategory: T;
  onSelect: (category: T) => void;
  className?: string;
}

export function CategoryPills<T extends string = string>({
  categories,
  activeCategory,
  onSelect,
  className = "",
}: CategoryPillsProps<T>) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar ${className}`}>
      {categories.map((topic) => {
        const isActive = activeCategory === topic.id;
        return (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-[#111827] text-slate-300 hover:text-white border border-[#1f2937] hover:bg-slate-800"
            }`}
          >
            {topic.icon && <span>{topic.icon}</span>}
            <span>{topic.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryPills;
