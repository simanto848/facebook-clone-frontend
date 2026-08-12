"use client";

import React, { useState, useEffect } from "react";
import { UserX, ShieldOff } from "lucide-react";
import Image from "next/image";
import { blockService } from "@/services/blockService";
import { Button } from "@/components/ui";

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
}

export default function BlockedUsersSection() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await blockService.getBlockedUsers();
      const items = res?.data || res || [];
      if (Array.isArray(items)) {
        setBlocked(
          items.map((u: any) => ({
            id: u.id,
            name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Blocked User",
            avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          }))
        );
      }
    } catch {
      setBlocked([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  const handleUnblock = async (id: string) => {
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    try {
      await blockService.unblockUser(id);
    } catch (err) {
      console.error("Unblock user error:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white space-y-4 mt-6">
      <div className="flex items-center gap-3 border-b border-[#1f2937] pb-3">
        <UserX size={20} className="text-red-400" />
        <div>
          <h3 className="font-bold text-base">Blocked Accounts</h3>
          <p className="text-xs text-slate-400">Manage users you have blocked from interacting with your profile</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-4">Loading blocked users...</p>
      ) : blocked.length === 0 ? (
        <p className="text-xs text-slate-500 py-4">You have not blocked any accounts.</p>
      ) : (
        <div className="divide-y divide-[#1f2937]">
          {blocked.map((user) => (
            <div key={user.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#1f2937]">
                  <Image src={user.avatar} fill sizes="36px" className="object-cover" alt={user.name} />
                </div>
                <span className="text-xs font-semibold text-white">{user.name}</span>
              </div>

              <Button
                size="sm"
                variant="secondary"
                leftIcon={<ShieldOff size={13} />}
                onClick={() => handleUnblock(user.id)}
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
