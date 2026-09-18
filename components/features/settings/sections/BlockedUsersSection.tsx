"use client";

import React, { useState, useEffect } from "react";
import { UserX, ShieldOff, Search, Plus, AlertCircle } from "lucide-react";
import Image from "next/image";
import { blockService } from "@/services/blockService";
import { Button, Dialog, Input } from "@/components/ui";

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
}

export default function BlockedUsersSection() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockTarget, setUnblockTarget] = useState<BlockedUser | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockUsername, setBlockUsername] = useState("");
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockUsername.trim() || blockingLoading) return;
    setBlockingLoading(true);
    setBlockError(null);
    try {
      await blockService.blockUser(blockUsername.trim());
      setBlocked((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          name: blockUsername.trim(),
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        },
      ]);
      setBlockUsername("");
      setIsBlockModalOpen(false);
    } catch (err: any) {
      setBlockError(err.response?.data?.message || err.message || "Failed to block user");
    } finally {
      setBlockingLoading(false);
    }
  };

  const fetchBlocked = async () => {
    setLoading(true);
    try {
      const res = await blockService.getBlockedUsers();
      const items = res?.data || res || [];
      if (Array.isArray(items)) {
        setBlocked(
          items.map((b: any) => {
            const u = b.blocked || b.user || b;
            return {
              id: u.id || b.blockedId || b.id,
              name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.displayName || u.username || "Blocked User",
              avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            };
          })
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

  const filteredBlocked = blocked.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 text-white space-y-4 mt-6">
      <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
        <div className="flex items-center gap-3">
          <UserX size={20} className="text-red-400" />
          <div>
            <h3 className="font-bold text-base">Blocked Accounts</h3>
            <p className="text-xs text-slate-400">Manage users you have blocked from interacting with your profile</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Plus size={13} />}
          onClick={() => setIsBlockModalOpen(true)}
        >
          Block User
        </Button>
      </div>

      {blocked.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter blocked accounts..."
            className="pl-9 h-9 text-xs bg-slate-800/60 border-slate-700 w-full"
          />
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-400 py-4">Loading blocked users...</p>
      ) : blocked.length === 0 ? (
        <p className="text-xs text-slate-500 py-4">You have not blocked any accounts.</p>
      ) : filteredBlocked.length === 0 ? (
        <p className="text-xs text-slate-400 py-4 text-center">No blocked accounts found matching "{searchQuery}".</p>
      ) : (
        <div className="divide-y divide-[#1f2937]">
          {filteredBlocked.map((user) => (
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
                onClick={() => setUnblockTarget(user)}
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={!!unblockTarget}
        onClose={() => setUnblockTarget(null)}
        title={`Unblock ${unblockTarget?.name}?`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            {unblockTarget?.name} will be able to see your timeline, follow you, and message you again depending on your privacy settings.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUnblockTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              loading={isUnblocking}
              onClick={async () => {
                if (!unblockTarget) return;
                setIsUnblocking(true);
                await handleUnblock(unblockTarget.id);
                setIsUnblocking(false);
                setUnblockTarget(null);
              }}
            >
              Unblock
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Block User Dialog */}
      <Dialog
        isOpen={isBlockModalOpen}
        onClose={() => {
          setIsBlockModalOpen(false);
          setBlockError(null);
          setBlockUsername("");
        }}
        title="Block an Account"
      >
        <form onSubmit={handleBlockSubmit} className="space-y-4">
          <p className="text-xs text-slate-300">
            Enter the user ID or username you wish to block. Once blocked, they will no longer be able to message you, view your profile, or see your posts.
          </p>

          {blockError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{blockError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">User ID or Username</label>
            <Input
              value={blockUsername}
              onChange={(e) => setBlockUsername(e.target.value)}
              placeholder="e.g. username or user ID"
              className="bg-slate-800/80 border-slate-700"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsBlockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              loading={blockingLoading}
              disabled={!blockUsername.trim()}
            >
              Confirm Block
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
