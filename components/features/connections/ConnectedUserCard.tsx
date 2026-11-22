import React from "react";
import Link from "next/link";
import { MessageSquare, UserX } from "lucide-react";
import { Card, CardContent, Avatar, Badge, Button } from "@/components/ui";

export interface ConnectedUserItem {
  id: string;
  name: string;
  avatar: string;
  role: string;
  mutual: number;
}

export interface ConnectedUserCardProps {
  user: ConnectedUserItem;
  isProcessing?: boolean;
  onMessage: (user: ConnectedUserItem) => void;
  onUnfriend: (user: ConnectedUserItem) => void;
  onViewMutual?: (user: ConnectedUserItem) => void;
}

export default function ConnectedUserCard({
  user,
  isProcessing = false,
  onMessage,
  onUnfriend,
  onViewMutual,
}: ConnectedUserCardProps) {
  return (
    <Card hover>
      <CardContent className="space-y-4">
        <Link href={`/profile/${user.id}`} className="flex items-start gap-3 group">
          <Avatar src={user.avatar} name={user.name} size="lg" online />
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.role}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="success" size="sm" pulse>
                Connected
              </Badge>
              {user.mutual > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewMutual?.(user);
                  }}
                  className="focus:outline-none"
                >
                  <Badge variant="secondary" size="sm" className="hover:bg-slate-700 cursor-pointer">
                    {user.mutual} mutual
                  </Badge>
                </button>
              )}
            </div>
          </div>
        </Link>

        <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
          <Button
            variant="primary"
            fullWidth
            size="sm"
            leftIcon={<MessageSquare size={14} />}
            onClick={() => onMessage(user)}
          >
            Message
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            onClick={() => onUnfriend(user)}
            title="Remove connection"
          >
            <UserX size={14} className="text-slate-400 hover:text-red-400" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
