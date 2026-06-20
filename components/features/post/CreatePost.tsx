import React from "react";
import { Images, Smile, Video } from "lucide-react";
import Image from "next/image";

const CreatePost = () => {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl overflow-hidden">
      <div className="flex gap-4 p-5">
        <div className="h-12 w-12 rounded-full overflow-hidden shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=500&auto=format&fit=crop&q=60"
            alt="Profile Image Alex"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>

        <textarea
          placeholder="What's on your mind, Alex?"
          className="
                flex-1
                h-28
                resize-none
                bg-transparent
                text-white
                placeholder:text-slate-400
                outline-none
              "
        />
      </div>

      <hr className="border-[#1f2937]" />

      <div className="flex items-center justify-between p-4">
        <div className="flex gap-2">
          <label
            htmlFor="photo"
            className="
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  cursor-pointer
                  hover:bg-[#1f2937]
                  transition
                "
          >
            <Images className="w-5 h-5 text-[#7aa2ff]" />
            <span className="text-slate-300">Photo</span>
          </label>

          <input type="file" id="photo" hidden accept="image/*" />

          <label
            htmlFor="video"
            className="
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  cursor-pointer
                  hover:bg-[#1f2937]
                  transition
                "
          >
            <Video className="w-5 h-5 text-[#ffb088]" />
            <span className="text-slate-300">Video</span>
          </label>

          <input type="file" id="video" hidden accept="video/*" />

          <div
            className="
                  flex items-center gap-2
                  px-3 py-2
                  rounded-lg
                  cursor-pointer
                  hover:bg-[#1f2937]
                  transition
                "
          >
            <Smile className="w-5 h-5 text-slate-400" />
            <span className="text-slate-300">Mood</span>
          </div>
        </div>

        <button
          className="
                bg-[#4b5d85]
                text-white
                font-medium
                px-6
                py-2
                rounded-full
                hover:bg-[#5c6f9c]
                transition
              "
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
