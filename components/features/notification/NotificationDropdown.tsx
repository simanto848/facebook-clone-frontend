"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2, Heart, MessageSquare, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, Tabs, EmptyState } from "@/components/ui";
import { notificationService } from "@/services/notificationService";

export interface NotificationItem {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
  type?: "like" | "comment" | "follow";
}

const fallbackNotifications: NotificationItem[] = [
  {
    id: "n1",
    sender: "David Kim",
    avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?w=100",
    text: "liked your post: \"Neon nights in the city.\"",
    time: "5m ago",
    unread: true,
    type: "like",
  },
  {
    id: "n2",
    sender: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?w=100",
    text: "commented: \"Wow, this looks incredible! What camera...\"",
    time: "1h ago",
    unread: true,
    type: "comment",
  },
  {
    id: "n3",
    sender: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    text: "started following your profile.",
    time: "4h ago",
    unread: false,
    type: "follow",
  },
];

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      const items = res?.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsed: NotificationItem[] = items.map((n: any) => ({
          id: n.id,
          sender: n.sender?.name || "Community Member",
          avatar: n.sender?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          text: n.message || n.text || "New notification activity",
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          unread: !n.isRead,
          type: n.type?.toLowerCase() || "like",
        }));
        setNotifications(parsed);
      }
    } catch {
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    try {
      await notificationService.markAsRead();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await notificationService.deleteNotification(id);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredList = activeTab === "unread" ? notifications.filter((n) => n.unread) : notifications;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-14 z-50 w-96 rounded-2xl border border-[#1f2937] bg-[#111827] shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-white select-none">
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm">Notifications</h3>
            {unreadCount > 0 && <Badge variant="primary">{unreadCount} New</Badge>}
          </div>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck size={14} />}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        </div>

        <Tabs
          tabs={[
            { id: "all", label: "All", badge: notifications.length },
            { id: "unread", label: "Unread", badge: unreadCount },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />

        <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {filteredList.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You're all caught up with your network activity."
            />
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition group ${
                  item.unread
                    ? "bg-blue-600/10 border-blue-500/30"
                    : "bg-[#111827] border-[#1f2937] hover:border-slate-700"
                }`}
              >
                <Avatar src={item.avatar} name={item.sender} size="md" />

                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs text-slate-200 leading-snug">
                    <span className="font-bold text-white mr-1">{item.sender}</span>
                    {item.text}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">{item.time}</p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition rounded-md"
                  title="Delete notification"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
