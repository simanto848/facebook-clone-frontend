import React from "react";
import Link from "next/link";
import { Check, X, MessageSquare } from "lucide-react";
import { Card, CardContent, Avatar, Badge, Button } from "@/components/ui";

export interface ConnectionUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  mutual: number;
}

export interface ConnectionRequestCardProps {
  user: ConnectionUser;
  isProcessing?: boolean;
  onAccept: (user: ConnectionUser) => void | Promise<void>;
  onDecline: (userId: string) => void | Promise<void>;
  onMessage: (user: ConnectionUser) => void;
  onViewMutual?: (user: ConnectionUser) => void;
}

export default function ConnectionRequestCard({
  user,
  isProcessing = false,
  onAccept,
  onDecline,
  onMessage,
  onViewMutual,
}: ConnectionRequestCardProps) {
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
            {user.mutual > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewMutual?.(user);
                }}
                className="focus:outline-none text-left"
              >
                <Badge variant="secondary" size="sm" className="hover:bg-slate-700 cursor-pointer">
                  {user.mutual} mutual connection{user.mutual > 1 ? "s" : ""}
                </Badge>
              </button>
            ) : (
              <Badge variant="outline" size="sm">
                New connection
              </Badge>
            )}
          </div>
        </Link>

        <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
          <Button
            variant="primary"
            fullWidth
            size="sm"
            disabled={isProcessing}
            leftIcon={<Check size={14} />}
            onClick={() => onAccept(user)}
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            fullWidth
            size="sm"
            disabled={isProcessing}
            leftIcon={<X size={14} />}
            onClick={() => onDecline(user.id)}
          >
            Ignore
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
