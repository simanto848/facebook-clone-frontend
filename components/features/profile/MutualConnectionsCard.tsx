import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent, Avatar, Button } from "@/components/ui";

export interface MutualFriendUser {
  id?: string;
  userId?: string;
  name?: string;
  username?: string;
  avatar?: string;
  avatarUrl?: string;
  profilePicture?: string;
}

export interface MutualConnectionsCardProps {
  mutualFriends: MutualFriendUser[];
  onViewConnections?: () => void;
  className?: string;
}

export function MutualConnectionsCard({
  mutualFriends,
  onViewConnections,
  className = "",
}: MutualConnectionsCardProps) {
  if (!mutualFriends || mutualFriends.length === 0) return null;

  return (
    <Card className={`border-[#1f2937] bg-[#111827]/80 ${className}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {mutualFriends.slice(0, 3).map((mf: MutualFriendUser, idx: number) => (
              <div key={mf.id || mf.userId || idx} className="inline-block ring-2 ring-[#111827] rounded-full">
                <Avatar
                  src={mf.avatar || mf.avatarUrl || mf.profilePicture}
                  name={mf.name || mf.username || "Friend"}
                  size="sm"
                />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users size={13} className="text-blue-400" />
              <span>
                {mutualFriends.length} Mutual Connection{mutualFriends.length > 1 ? "s" : ""}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              Including {mutualFriends.slice(0, 2).map((m) => m.name || m.username).join(", ")}
              {mutualFriends.length > 2
                ? ` and ${mutualFriends.length - 2} other${mutualFriends.length > 3 ? "s" : ""}`
                : ""}
            </p>
          </div>
        </div>
        {onViewConnections && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewConnections}
            className="text-xs text-blue-400 hover:text-white self-end sm:self-auto cursor-pointer"
          >
            View Connections
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default MutualConnectionsCard;
