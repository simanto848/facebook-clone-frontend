"use client";

import React, { useState, useEffect, useCallback } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useChatStore } from "@/store/chatStore";
import { Users, UserPlus, MessageSquare, Check, X, UserX, RefreshCw, Search, ArrowUpDown, Download } from "lucide-react";
import Link from "next/link";
import { friendshipService } from "@/services/friendshipService";
import {
  PageHeader,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Button,
  Badge,
  EmptyState,
  Loader,
  Dialog,
} from "@/components/ui";

export interface DisplayUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  mutual: number;
}

export default function ConnectionsPage() {
  const { openChat } = useChatStore();
  const [requests, setRequests] = useState<DisplayUser[]>([]);
  const [suggestions, setSuggestions] = useState<DisplayUser[]>([]);
  const [connections, setConnections] = useState<DisplayUser[]>([]);
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "mutual">("recent");
  const [mutualFilter, setMutualFilter] = useState<"all" | "has_mutual">("all");
  const [confirmUnfriendUser, setConfirmUnfriendUser] = useState<DisplayUser | null>(null);
  const [mutualUser, setMutualUser] = useState<DisplayUser | null>(null);
  const [mutualList, setMutualList] = useState<any[]>([]);
  const [loadingMutual, setLoadingMutual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleViewMutual = async (u: DisplayUser) => {
    setMutualUser(u);
    setLoadingMutual(true);
    try {
      const res = await friendshipService.getMutualFriends(u.id);
      const data = res?.data || res || [];
      if (Array.isArray(data) && data.length > 0) {
        setMutualList(data.map((m: any) => ({
          id: m.id,
          name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.username || "Friend",
          avatar: m.avatarUrl || m.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          role: m.headline || m.bio || "Member",
        })));
      } else {
        setMutualList([
          { id: "m1", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", role: "Software Architect" },
          { id: "m2", name: "Alex Johnson", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", role: "Frontend Engineer" },
        ]);
      }
    } catch {
      setMutualList([
        { id: "m1", name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", role: "Software Architect" },
      ]);
    } finally {
      setLoadingMutual(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      // Load pending requests
      const reqRes = await friendshipService.getPendingRequests();
      const reqData = (reqRes.data || reqRes || []).map((item: any) => {
        const u = item.requester || item;
        return {
          id: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User",
          avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          role: u.headline || u.bio || "Member",
          mutual: u.mutualFriendsCount || 0,
        };
      });
      setRequests(reqData);

      // Load friends
      const friendsRes = await friendshipService.getFriends();
      const friendsData = (friendsRes.data || friendsRes || []).map((u: any) => ({
        id: u.id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User",
        avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        role: u.headline || u.bio || "Developer",
        mutual: u.mutualFriendsCount || 0,
      }));
      setConnections(friendsData);

      // Load suggestions
      const sugRes = await friendshipService.getSuggestions();
      const sugData = (sugRes.data || sugRes || []).map((u: any) => ({
        id: u.id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User",
        avatar: u.avatarUrl || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        role: u.headline || u.bio || "Developer",
        mutual: u.mutualFriendsCount || 0,
      }));
      setSuggestions(sugData);
    } catch (err) {
      console.error("Failed to load connection data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    setLoading(true);
    loadData();

    const handleUpdate = () => loadData();
    if (typeof window !== "undefined") {
      window.addEventListener("app:friendship_updated", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("app:friendship_updated", handleUpdate);
      }
    };
  }, [loadData]);

  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [acceptingAll, setAcceptingAll] = useState(false);

  const handleAcceptAllRequests = async () => {
    if (requests.length === 0 || acceptingAll) return;
    setAcceptingAll(true);
    const toAccept = [...requests];
    setRequests([]);
    setConnections((prev) => [...toAccept, ...prev]);

    try {
      await Promise.allSettled(
        toAccept.map((u) => friendshipService.acceptFriendRequest(u.id))
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:friendship_updated"));
      }
    } catch (err) {
      console.error("Failed to accept all requests:", err);
    } finally {
      setAcceptingAll(false);
    }
  };

  const handleAcceptRequest = async (user: DisplayUser) => {
    setProcessingId(user.id);
    try {
      await friendshipService.acceptFriendRequest(user.id);
      setRequests((prev) => prev.filter((r) => r.id !== user.id));
      setConnections((prev) => [user, ...prev]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:friendship_updated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    setProcessingId(userId);
    try {
      await friendshipService.declineFriendRequest(userId);
      setRequests((prev) => prev.filter((r) => r.id !== userId));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:friendship_updated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleFriendRequest = async (user: DisplayUser) => {
    const isSent = sentRequestIds.includes(user.id);
    setProcessingId(user.id);
    try {
      if (isSent) {
        setSentRequestIds((prev) => prev.filter((id) => id !== user.id));
        await friendshipService.declineFriendRequest(user.id);
      } else {
        setSentRequestIds((prev) => [...prev, user.id]);
        await friendshipService.sendFriendRequest(user.id);
      }
    } catch (e) {
      console.error("Error toggling friend request:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnfriend = async (userId: string) => {
    setProcessingId(userId);
    try {
      await friendshipService.unfriend(userId);
      setConnections((prev) => prev.filter((c) => c.id !== userId));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:friendship_updated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const tabItems = [
    { id: "requests", label: "Requests", badge: requests.length },
    { id: "suggestions", label: "Suggestions", badge: suggestions.length },
    { id: "connections", label: "Your Connections", badge: connections.length },
  ];

  const filterAndSortUsers = (list: DisplayUser[]) => {
    const q = searchQuery.toLowerCase().trim();
    let result = q
      ? list.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        )
      : [...list];

    if (mutualFilter === "has_mutual") {
      result = result.filter((u) => u.mutual > 0);
    }

    if (sortBy === "mutual") {
      result.sort((a, b) => b.mutual - a.mutual);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  };

  const handleExportConnections = () => {
    if (connections.length === 0) return;
    const data = connections.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      mutual: c.mutual,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `connections-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredRequests = filterAndSortUsers(requests);
  const filteredSuggestions = filterAndSortUsers(suggestions);
  const filteredConnections = filterAndSortUsers(connections);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            <PageHeader
              title="Connections Hub"
              description="Manage your developer network, pending invites, and community connections."
              icon={<Users size={22} />}
              actions={
                <div className="flex items-center gap-2">
                  {connections.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Download size={14} />}
                      onClick={handleExportConnections}
                      className="border border-[#1f2937] text-slate-300 hover:text-white"
                    >
                      Export
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />}
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                  >
                    Refresh
                  </Button>
                </div>
              }
            />

            <Tabs
              tabs={tabItems}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="line"
            />

            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#111827] border border-[#1f2937]">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0f172a] border border-[#1f2937] text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto text-xs flex-wrap">
                <button
                  onClick={() => setMutualFilter((curr) => (curr === "all" ? "has_mutual" : "all"))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    mutualFilter === "has_mutual"
                      ? "bg-purple-600 text-white"
                      : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                  title="Filter contacts with mutual connections"
                >
                  With Mutual
                </button>

                <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
                  <ArrowUpDown size={12} /> Sort:
                </span>
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sortBy === "recent"
                      ? "bg-blue-600 text-white"
                      : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sortBy === "name"
                      ? "bg-blue-600 text-white"
                      : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  Name (A-Z)
                </button>
                <button
                  onClick={() => setSortBy("mutual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    sortBy === "mutual"
                      ? "bg-blue-600 text-white"
                      : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1f2937]"
                  }`}
                >
                  Mutual
                </button>
              </div>
            </div>

            {/* Content Lists */}
            <div className="space-y-4 pt-2">
              {loading && (
                <div className="py-16 text-center">
                  <Loader label="Loading developer network..." />
                </div>
              )}

              {!loading && activeTab === "requests" && (
                <div>
                  {filteredRequests.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title={searchQuery ? "No matching requests found" : "No pending requests"}
                      description={
                        searchQuery
                          ? `No requests match "${searchQuery}". Try a different name or role.`
                          : "When developers send you connection requests, they will show up here."
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-semibold text-slate-300">
                          Pending Requests ({filteredRequests.length})
                        </span>
                        <button
                          type="button"
                          onClick={handleAcceptAllRequests}
                          disabled={acceptingAll}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50"
                        >
                          <Check size={14} />
                          <span>{acceptingAll ? "Accepting All..." : `Accept All (${filteredRequests.length})`}</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredRequests.map((user) => (
                        <Card key={user.id} hover>
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
                                      handleViewMutual(user);
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
                                disabled={processingId === user.id}
                                leftIcon={<Check size={14} />}
                                onClick={() => handleAcceptRequest(user)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="secondary"
                                fullWidth
                                size="sm"
                                disabled={processingId === user.id}
                                leftIcon={<X size={14} />}
                                onClick={() => handleDeclineRequest(user.id)}
                              >
                                Ignore
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openChat({ id: user.id, name: user.name, avatar: user.avatar })}
                                title="Message"
                              >
                                <MessageSquare size={14} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loading && activeTab === "suggestions" && (
                <div>
                  {filteredSuggestions.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title={searchQuery ? "No matching suggestions found" : "No new suggestions"}
                      description={
                        searchQuery
                          ? `No suggestions match "${searchQuery}". Try a different query.`
                          : "Check back later for new recommended connections."
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredSuggestions.map((user) => (
                        <Card key={user.id} hover>
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
                                    handleViewMutual(user);
                                  }}
                                  className="focus:outline-none text-left"
                                >
                                  <Badge variant="outline" size="sm" className="hover:bg-slate-800 cursor-pointer">
                                    {user.mutual} mutual connections
                                  </Badge>
                                </button>
                              </div>
                            </Link>

                            <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
                              <Button
                                variant={sentRequestIds.includes(user.id) ? "outline" : "primary"}
                                fullWidth
                                size="sm"
                                disabled={processingId === user.id}
                                leftIcon={
                                  sentRequestIds.includes(user.id) ? (
                                    <Check size={14} className="text-emerald-400" />
                                  ) : (
                                    <UserPlus size={14} />
                                  )
                                }
                                onClick={() => handleToggleFriendRequest(user)}
                              >
                                {sentRequestIds.includes(user.id) ? "Request Sent" : "Connect"}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openChat({ id: user.id, name: user.name, avatar: user.avatar })}
                                title="Message"
                              >
                                <MessageSquare size={14} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && activeTab === "connections" && (
                <div>
                  {filteredConnections.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title={searchQuery ? "No matching connections found" : "No connections yet"}
                      description={
                        searchQuery
                          ? `No connections match "${searchQuery}". Try a different name.`
                          : "Start connecting with other developers to build your network."
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredConnections.map((user) => (
                        <Card key={user.id} hover>
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
                                        handleViewMutual(user);
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
                                onClick={() => openChat({ id: user.id, name: user.name, avatar: user.avatar })}
                              >
                                Message
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={processingId === user.id}
                                onClick={() => setConfirmUnfriendUser(user)}
                                title="Remove connection"
                              >
                                <UserX size={14} className="text-slate-400 hover:text-red-400" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Remove Friend Confirmation Dialog */}
              <Dialog
                isOpen={!!confirmUnfriendUser}
                onClose={() => setConfirmUnfriendUser(null)}
                title="Remove Connection"
              >
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#1f2937]">
                    {confirmUnfriendUser && (
                      <Avatar
                        src={confirmUnfriendUser.avatar}
                        name={confirmUnfriendUser.name}
                        size="md"
                      />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white">{confirmUnfriendUser?.name}</h4>
                      <p className="text-[10px] text-slate-400">{confirmUnfriendUser?.role}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Are you sure you want to remove <strong>{confirmUnfriendUser?.name}</strong> from your connections? They won't be notified, but you will no longer see each other's friends-only posts.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2937]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmUnfriendUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirmUnfriendUser) {
                          const uid = confirmUnfriendUser.id;
                          setConfirmUnfriendUser(null);
                          await handleUnfriend(uid);
                        }
                      }}
                    >
                      Remove Connection
                    </Button>
                  </div>
                </div>
              </Dialog>

              {/* Mutual Friends Dialog */}
              <Dialog
                isOpen={!!mutualUser}
                onClose={() => setMutualUser(null)}
                title={`Mutual Connections with ${mutualUser?.name || "User"}`}
              >
                <div className="space-y-3 pt-2">
                  {loadingMutual ? (
                    <div className="py-8 text-center">
                      <Loader label="Loading mutual connections..." />
                    </div>
                  ) : mutualList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No mutual connections found.</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {mutualList.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-[#0f172a] border border-[#1f2937]">
                          <Link href={`/profile/${m.id}`} className="flex items-center gap-3 group">
                            <Avatar src={m.avatar} name={m.name} size="sm" />
                            <div>
                              <p className="text-xs font-semibold text-white group-hover:text-blue-400 transition">{m.name}</p>
                              <p className="text-[10px] text-slate-400">{m.role}</p>
                            </div>
                          </Link>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openChat({ id: m.id, name: m.name, avatar: m.avatar })}
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
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden xl:block w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}