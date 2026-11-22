import React from "react";
import Link from "next/link";
import { Check, UserPlus, MessageSquare } from "lucide-react";
import { Card, CardContent, Avatar, Badge, Button } from "@/components/ui";

export interface ConnectionSuggestionUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  mutual: number;
}

export interface ConnectionSuggestionCardProps {
  user: ConnectionSuggestionUser;
  isSent?: boolean;
  isProcessing?: boolean;
  onToggleRequest: (user: ConnectionSuggestionUser) => void | Promise<void>;
  onMessage: (user: ConnectionSuggestionUser) => void;
  onViewMutual?: (user: ConnectionSuggestionUser) => void;
}

export default function ConnectionSuggestionCard({
  user,
  isSent = false,
  isProcessing = false,
  onToggleRequest,
  onMessage,
  onViewMutual,
}: ConnectionSuggestionCardProps) {
  return (
    <Card hover>
      <CardContent className="space-y-4">
        <Link href={`/profile/${user.id}`} className="flex items-start gap-3 group">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.role}</p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewMutual?.(user);
              }}
              className="focus:outline-none text-left"
            >
              <Badge variant="outline" size="sm" className="hover:bg-slate-800 cursor-pointer">
                {user.mutual} mutual connection{user.mutual === 1 ? "" : "s"}
              </Badge>
            </button>
          </div>
        </Link>

        <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
          <Button
            variant={isSent ? "outline" : "primary"}
            fullWidth
            size="sm"
            disabled={isProcessing}
            leftIcon={
              isSent ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <UserPlus size={14} />
              )
            }
            onClick={() => onToggleRequest(user)}
          >
            {isSent ? "Request Sent" : "Connect"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onMessage(user)}
            title="Message"
          >
            <MessageSquare size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
