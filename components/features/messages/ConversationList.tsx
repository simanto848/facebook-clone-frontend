import { Search } from "lucide-react";
import Image from "next/image";

const users = [
  {
    id: 1,
    name: "Sarah Wilson",
    message: "See you tomorrow!",
    online: true,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  },
  {
    id: 2,
    name: "Alex Johnson",
    message: "Working on it.",
    online: false,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
  },
  {
    id: 3,
    name: "Emma Brown",
    message: "That's awesome 🔥",
    online: true,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300",
  },
];

export default function ConversationList() {
  return (
    <div className="h-full">
      <div className="p-5">
        <h1 className="text-2xl font-bold text-white">Messages</h1>

        <div className="mt-4 flex items-center rounded-xl bg-[#1f2937] px-4">
          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search..."
            className="h-11 flex-1 bg-transparent px-3 text-white outline-none"
          />
        </div>
      </div>

      <div className="space-y-1 px-3">
        {users.map((user) => (
          <button
            key={user.id}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#1f2937]"
          >
            <div className="relative">
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />

              {user.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-green-500" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-medium text-white">{user.name}</h3>

              <p className="truncate text-sm text-slate-400">{user.message}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
