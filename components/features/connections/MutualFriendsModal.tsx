import React, { useState } from "react";
import Link from "next/link";
import { Search, X, MessageSquare } from "lucide-react";
import { Dialog, Avatar, Button, Loader } from "@/components/ui";

export interface MutualFriendItem {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface MutualFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserName?: string;
  mutualList: MutualFriendItem[];
  loading?: boolean;
  onMessageClick: (friend: MutualFriendItem) => void;
}

export default function MutualFriendsModal({
  isOpen,
  onClose,
  targetUserName = "User",
  mutualList,
  loading = false,
  onMessageClick,
}: MutualFriendsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredList = searchQuery.trim()
    ? mutualList.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : mutualList;

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Mutual Connections with ${targetUserName}`}
    >
      <div className="space-y-3 pt-2">
        {mutualList.length > 0 && !loading && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search mutual contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center">
            <Loader label="Loading mutual connections..." />
          </div>
        ) : mutualList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No mutual connections found.</p>
        ) : filteredList.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No mutual connections found matching &quot;{searchQuery}&quot;.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredList.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0f172a] border border-[#1f2937]"
              >
                <Link href={`/profile/${m.id}`} className="flex items-center gap-3 group">
                  <Avatar src={m.avatar} name={m.name} size="sm" />
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{m.role}</p>
                  </div>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onMessageClick(m)}
                  leftIcon={<MessageSquare size={12} />}
                >
                  Message
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
