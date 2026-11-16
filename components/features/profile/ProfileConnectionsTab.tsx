import React from "react";
import { Avatar, Button } from "@/components/ui";

export interface ProfileConnectionItem {
  id?: string;
  name: string;
  avatar?: string;
  handle?: string;
  username?: string;
}

export interface ProfileConnectionsTabProps {
  connections?: ProfileConnectionItem[];
  onMessageClick: (connection: ProfileConnectionItem) => void;
  className?: string;
}

const DEFAULT_CONNECTIONS: ProfileConnectionItem[] = [
  {
    id: "friend-sarah",
    name: "Sarah Connor",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    handle: "sarahc",
  },
  {
    id: "friend-elena",
    name: "Elena Rostova",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
    handle: "elena",
  },
  {
    id: "friend-david",
    name: "David Kim",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    handle: "davidk",
  },
];

export function ProfileConnectionsTab({
  connections = DEFAULT_CONNECTIONS,
  onMessageClick,
  className = "",
}: ProfileConnectionsTabProps) {
  const list = connections.length > 0 ? connections : DEFAULT_CONNECTIONS;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}
    >
      {list.map((friend, i) => (
        <div
          key={friend.id || i}
          className="flex items-center justify-between p-4 rounded-2xl bg-[#111827] border border-[#1f2937]"
        >
          <div className="flex items-center gap-3">
            <Avatar src={friend.avatar} name={friend.name} size="md" />
            <div>
              <p className="text-xs font-bold text-white">{friend.name}</p>
              <p className="text-[10px] text-slate-400">
                @{friend.handle || friend.username || "user"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMessageClick(friend)}
            className="text-blue-400 hover:bg-blue-600/10 text-xs"
          >
            Message
          </Button>
        </div>
      ))}
    </div>
  );
}

export default ProfileConnectionsTab;
