import Image from "next/image";
import { Plus } from "lucide-react";
import React from "react";

const Stories = () => {
  return (
    <div className="flex gap-5">
      {/* Add Story */}
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 bg-[#1f2937] border border-[#374151] rounded-full flex justify-center items-center">
          <Plus className="w-6 h-6 text-[#8ea2d5]" />
        </div>

        <span className="text-slate-300 text-sm mt-2">Add Story</span>
      </div>

      {/* Story */}
      <div className="flex flex-col items-center">
        <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600">
          <div className="h-14 w-14 rounded-full overflow-hidden bg-[#111827] p-0.5">
            <Image
              src="https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=1587&auto=format&fit=crop"
              alt="Profile"
              width={56}
              height={56}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
        </div>

        <span className="text-slate-300 text-sm mt-2">Sarah</span>
      </div>
    </div>
  );
};

export default Stories;
