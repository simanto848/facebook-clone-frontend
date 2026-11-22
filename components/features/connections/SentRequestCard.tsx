import React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Card, CardContent, Avatar, Button } from "@/components/ui";

export interface SentRequestUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  mutual?: number;
}

export interface SentRequestCardProps {
  user: SentRequestUser;
  isProcessing?: boolean;
  onCancelRequest: (user: SentRequestUser | any) => void | Promise<void>;
}

export default function SentRequestCard({
  user,
  isProcessing = false,
  onCancelRequest,
}: SentRequestCardProps) {
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
            <span className="text-[10px] text-amber-400 font-medium">Pending Response</span>
          </div>
        </Link>
        <div className="pt-2 border-t border-[#1f2937]/60">
          <Button
            variant="secondary"
            fullWidth
            size="sm"
            leftIcon={<X size={14} />}
            loading={isProcessing}
            onClick={() => onCancelRequest(user)}
            className="border border-[#1f2937] text-slate-300 hover:text-red-400"
          >
            Cancel Request
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
