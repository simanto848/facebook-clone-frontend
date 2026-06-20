import CreatePost from "@/components/features/post/CreatePost";
import PostCard from "@/components/features/post/PostCard";
import {
  BadgeInfo,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Users,
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* COVER + PROFILE HEADER */}
      <div className="relative">
        {/* Cover */}
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800"
            alt="Cover"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Avatar */}
        <div className="absolute left-12 -bottom-16">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#0f172a] shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Image
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
              alt="Alex Rivers"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-12 pt-20 pb-8 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold">Alex Rivers</h1>

          <p className="mt-2 text-lg text-slate-400">
            @alex • Neo-Tokyo • Digital Architect
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-medium hover:bg-blue-600 transition">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-12 pb-10">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="col-span-3 space-y-6">
            {/* About */}
            <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6">
              <div className="mb-4 flex items-center gap-2">
                <BadgeInfo size={18} />
                <h2 className="font-semibold">About</h2>
              </div>

              <p className="text-sm leading-8 text-slate-400">
                Designing the future of spatial interfaces. Obsessed with
                luminance, depth, and performance. Always exploring the
                intersection of brutalism and glassmorphism.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-xs">
                  UI/UX
                </span>

                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-xs">
                  WebGL
                </span>

                <span className="rounded-full bg-[#1f2937] px-3 py-1 text-xs">
                  Systems
                </span>
              </div>
            </div>

            {/* Recent */}
            <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Recent</h2>

                <button className="text-sm text-blue-400">See All</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-xl bg-[#1f2937]" />
                <div className="aspect-square rounded-xl bg-[#1f2937]" />
                <div className="aspect-square rounded-xl bg-[#1f2937]" />

                <button className="aspect-square rounded-xl bg-[#1f2937] flex items-center justify-center hover:bg-[#263247] transition">
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="col-span-6 space-y-6">
            {/* Create Post */}
            <CreatePost />

            {/* Post */}
            <PostCard />
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-span-3 space-y-6">
            <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6">
              <div className="mb-5 flex items-center gap-2">
                <Users size={18} />
                <h2 className="font-semibold">Top Connections</h2>
              </div>

              <div className="space-y-4">
                {["Sarah Chen", "David Park", "Elena Rostova"].map((user) => (
                  <div key={user} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1f2937]" />

                    <div>
                      <p>{user}</p>

                      <p className="text-xs text-slate-400">Product Designer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6">
              <h2 className="mb-4 font-semibold">Guilds</h2>

              <div className="space-y-3">
                <div className="rounded-xl bg-[#1f2937] p-3">UI Brutalists</div>

                <div className="rounded-xl bg-[#1f2937] p-3">
                  Core Infrastructure
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
