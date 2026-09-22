"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Filter, 
  Search, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { Avatar, Badge, Button, EmptyState, Tabs } from "@/components/ui";
import { notificationService } from "@/services/notificationService";

export interface NotificationItem {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
  type?: "like" | "comment" | "follow" | "mention" | "system" | "friend_request";
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
    text: "sent you a friend connection request.",
    time: "3h ago",
    unread: true,
    type: "friend_request",
  },
  {
    id: "n4",
    sender: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    text: "started following your profile updates.",
    time: "4h ago",
    unread: false,
    type: "follow",
  },
  {
    id: "n5",
    sender: "Alex Thorne",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    text: "mentioned you in a comment on Tech Meetup 2026.",
    time: "1d ago",
    unread: false,
    type: "mention",
  },
  {
    id: "n6",
    sender: "System Security",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
    text: "Your account security settings were reviewed successfully.",
    time: "2d ago",
    unread: false,
    type: "system",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [readBanner, setReadBanner] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(1, 50);
      const items = res?.data || res || [];
      if (Array.isArray(items) && items.length > 0) {
        const parsed: NotificationItem[] = items.map((n: any) => ({
          id: n.id || n._id,
          sender: n.sender?.name || (n.sender?.firstName ? `${n.sender.firstName} ${n.sender.lastName || ""}`.trim() : "Community Member"),
          avatar: n.sender?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          text: n.message || n.text || "New notification activity",
          time: n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently",
          unread: !n.isRead,
          type: (n.type?.toLowerCase() as any) || "system",
        }));
        setNotifications(parsed);
      }
    } catch {
      // Fallback notifications preserved
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setReadBanner("All notifications have been marked as read.");
      setTimeout(() => setReadBanner(null), 3000);
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      setReadBanner("All notifications have been marked as read.");
      setTimeout(() => setReadBanner(null), 3000);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead([id]);
    } catch {
      // Optimistic update anyway
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
    } catch {
      // Continue optimistic remove
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const readCount = notifications.length - unreadCount;

  const handleClearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => n.unread));
    setReadBanner("Cleared all read notifications from view.");
    setTimeout(() => setReadBanner(null), 3000);
  };

  const primaryTabs = [
    { id: "all", label: `All (${notifications.length})` },
    { id: "unread", label: `Unread (${unreadCount})` },
  ];

  const typeFilterPills = [
    { id: "all", label: "All Types" },
    { id: "like", label: `Likes (${notifications.filter((n) => n.type === "like").length})` },
    { id: "comment", label: `Comments (${notifications.filter((n) => n.type === "comment").length})` },
    { id: "mention", label: `Mentions (${notifications.filter((n) => n.type === "mention").length})` },
    { id: "friend_request", label: `Requests (${notifications.filter((n) => n.type === "friend_request" || n.type === "follow").length})` },
    { id: "system", label: `System (${notifications.filter((n) => n.type === "system").length})` },
  ];

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread" && !item.unread) return false;
    if (typeFilter !== "all") {
      if (typeFilter === "friend_request") {
        if (item.type !== "friend_request" && item.type !== "follow") return false;
      } else if (item.type !== typeFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.sender.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getIcon = (type?: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case "comment":
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />;
      case "follow":
      case "friend_request":
        return <UserPlus className="w-3.5 h-3.5 text-emerald-500" />;
      case "mention":
        return <Bell className="w-3.5 h-3.5 text-purple-500 fill-purple-500" />;
      case "system":
        return <Bell className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-primary fill-primary" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/40 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground font-semibold px-2 py-0.5 text-xs rounded-full">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Stay updated on your interactions, mentions, and updates</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {readCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearReadNotifications}
              className="flex items-center gap-1.5 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-border/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Read
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || unreadCount === 0}
            className="flex items-center gap-2 rounded-xl text-xs font-medium"
          >
            <CheckCheck className="w-4 h-4 text-primary" />
            {markingAll ? "Marking..." : "Mark all as read"}
          </Button>
        </div>
      </div>

      {readBanner && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{readBanner}</span>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs
            tabs={primaryTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
          />

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Sub-category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {typeFilterPills.map((pill) => {
            const isSelected = typeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setTypeFilter(pill.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card border border-border/40 rounded-2xl shadow-sm divide-y divide-border/30 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Bell className="w-10 h-10 text-muted-foreground" />}
              title="No notifications found"
              description={
                searchQuery
                  ? "No notifications match your search query."
                  : activeTab === "unread"
                  ? "You are all caught up! No unread notifications."
                  : "You don't have any notifications at the moment."
              }
            />
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/40 cursor-pointer ${
                item.unread ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={item.avatar}
                    alt={item.sender}
                    className="w-10 h-10 ring-2 ring-background rounded-full"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card shadow-sm border border-border/40 flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm text-foreground leading-snug">
                    <span className="font-semibold hover:underline mr-1">{item.sender}</span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </p>
                  <span className="text-xs text-muted-foreground/80 mt-1 block">
                    {item.time}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                {item.unread && (
                  <button
                    onClick={(e) => handleMarkSingleAsRead(item.id, e)}
                    title="Mark as read"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteNotification(item.id, e)}
                  title="Delete notification"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
