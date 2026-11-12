import React from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";

export interface FeedLayoutWrapperProps {
  children: React.ReactNode;
  showLeftSidebar?: boolean;
  showRightSidebar?: boolean;
  maxWidthClassName?: string;
  className?: string;
}

export function FeedLayoutWrapper({
  children,
  showLeftSidebar = true,
  showRightSidebar = true,
  maxWidthClassName = "max-w-3xl",
  className = "",
}: FeedLayoutWrapperProps) {
  return (
    <div className={`min-h-screen bg-[#0f172a] text-white ${className}`}>
      <div className="flex">
        {/* LEFT SIDEBAR */}
        {showLeftSidebar && (
          <aside className="hidden lg:block w-72 shrink-0">
            <LeftSidebar />
          </aside>
        )}

        {/* MAIN FEED CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className={`w-full ${maxWidthClassName} px-6 py-6 space-y-6`}>
            {children}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        {showRightSidebar && (
          <aside className="hidden xl:block w-80 shrink-0">
            <RightSidebar />
          </aside>
        )}
      </div>
    </div>
  );
}

export default FeedLayoutWrapper;
