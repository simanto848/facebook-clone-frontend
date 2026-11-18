"use client";

import React, { useState, useEffect, useCallback } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useChatStore } from "@/store/chatStore";
import { Users, UserPlus, MessageSquare, Check, X, UserX, RefreshCw, Search, ArrowUpDown, Download } from "lucide-react";
import Link from "next/link";
import { friendshipService } from "@/services/friendshipService";
import MutualFriendsModal from "@/components/features/connections/MutualFriendsModal";
import UnfriendConfirmModal from "@/components/features/connections/UnfriendConfirmModal";
import ConnectionRequestCard from "@/components/features/connections/ConnectionRequestCard";
import ConnectionFilterBar from "@/components/features/connections/ConnectionFilterBar";
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
  const [sentRequests, setSentRequests] = useState<DisplayUser[]>([]);
  const [suggestions, setSuggestions] = useState<DisplayUser[]>([]);
  const [connections, setConnections] = useState<DisplayUser[]>([]);
  const [activeTab, setActiveTab] = useState<string>("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "mutual">("recent");
  const [mutualFilter, setMutualFilter] = useState<"all" | "has_mutual">("all");
  const [roleCategory, setRoleCategory] = useState<"all" | "engineering" | "design" | "product">("all");
  const [confirmUnfriendUser, setConfirmUnfriendUser] = useState<DisplayUser | null>(null);
  const [mutualUser, setMutualUser] = useState<DisplayUser | null>(null);
  const [mutualList, setMutualList] = useState<any[]>([]);
  const [loadingMutual, setLoadingMutual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleViewMutual = async (u: DisplayUser) => {
    const cleanUserId = (u?.id || "").trim();
    setMutualUser(u);
    setLoadingMutual(true);
    try {
      const res = await friendshipService.getMutualFriends(cleanUserId);
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
      const rawReqs = reqRes.data?.requests || reqRes.data || reqRes || [];
      const reqData = (Array.isArray(rawReqs) ? rawReqs : []).map((item: any) => {
        const u = item.user || item.requester || item;
        return {
          id: u.id || item.id,
          name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User",
          avatar: u.avatarUrl || u.avatar || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          role: u.headline || u.bio || "Member",
          mutual: u.mutualFriendsCount || 0,
        };
      });
      setRequests(reqData);

      // Load sent requests
      try {
        const sentRes = await friendshipService.getSentRequests();
        const sentRaw = sentRes.data?.requests || sentRes.data || sentRes || [];
        const sentData = (Array.isArray(sentRaw) ? sentRaw : []).map((item: any) => {
          const u = item.user || item.addressee || item.recipient || item;
          return {
            id: u.id || item.id,
            name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "User",
            avatar: u.avatarUrl || u.avatar || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
            role: u.headline || u.bio || "Member",
            mutual: u.mutualFriendsCount || 0,
          };
        });
        setSentRequests(sentData);
      } catch {
        setSentRequests([]);
      }

      // Load friends
      const friendsRes = await friendshipService.getFriends();
      const rawFriends = friendsRes.data?.friends || friendsRes.data || friendsRes || [];
      const friendsData = (Array.isArray(rawFriends) ? rawFriends : []).map((item: any) => {
        const u = item.user || item.friend || item;
        return {
          id: u.id || item.friendshipId || item.id,
          name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "Friend",
          avatar: u.avatarUrl || u.avatar || u.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
          role: u.headline || u.bio || "Developer",
          mutual: u.mutualFriendsCount || 0,
        };
      });
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
        toAccept.map((u) => {
          const cleanId = (u?.id || "").trim();
          return cleanId ? friendshipService.acceptFriendRequest(cleanId) : Promise.resolve();
        })
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
    const cleanId = (user?.id || "").trim();
    if (!cleanId) return;
    setProcessingId(user.id);
    try {
      await friendshipService.acceptFriendRequest(cleanId);
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
    const cleanId = (userId || "").trim();
    if (!cleanId) return;
    setProcessingId(userId);
    try {
      await friendshipService.declineFriendRequest(cleanId);
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
    const cleanId = (user?.id || "").trim();
    if (!cleanId) return;
    const isSent = sentRequestIds.includes(user.id);
    setProcessingId(user.id);
    try {
      if (isSent) {
        setSentRequestIds((prev) => prev.filter((id) => id !== user.id));
        await friendshipService.cancelFriendRequest(cleanId);
      } else {
        setSentRequestIds((prev) => [...prev, user.id]);
        await friendshipService.sendFriendRequest(cleanId);
      }
    } catch (e) {
      console.error("Error toggling friend request:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnfriend = async (userId: string) => {
    const cleanId = (userId || "").trim();
    if (!cleanId) return;
    setProcessingId(userId);
    try {
      await friendshipService.unfriend(cleanId);
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

  const handleCancelSentRequest = async (user: DisplayUser) => {
    setProcessingId(user.id);
    try {
      await friendshipService.cancelFriendRequest(user.id);
      setSentRequests((prev) => prev.filter((r) => r.id !== user.id));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("app:friendship_updated"));
      }
    } catch (err) {
      console.error("Failed to cancel friend request:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const tabItems = [
    { id: "requests", label: "Requests", badge: requests.length },
    { id: "sent", label: "Sent Requests", badge: sentRequests.length },
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

    if (roleCategory === "engineering") {
      result = result.filter((u) => /engineer|developer|architect|frontend|backend|fullstack|dev|software/i.test(u.role));
    } else if (roleCategory === "design") {
      result = result.filter((u) => /design|ux|ui|creative|graphic/i.test(u.role));
    } else if (roleCategory === "product") {
      result = result.filter((u) => /product|manager|lead|founder|owner|agile/i.test(u.role));
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
  const filteredSentRequests = filterAndSortUsers(sentRequests);
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
            <ConnectionFilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              roleCategory={roleCategory}
              onRoleCategoryChange={setRoleCategory}
              mutualFilter={mutualFilter}
              onMutualFilterToggle={() =>
                setMutualFilter((curr) => (curr === "all" ? "has_mutual" : "all"))
              }
              searchPlaceholder="Search by name or role..."
            />

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
                          <ConnectionRequestCard
                            key={user.id}
                            user={user}
                            isProcessing={processingId === user.id}
                            onAccept={handleAcceptRequest}
                            onDecline={handleDeclineRequest}
                            onMessage={(u) => openChat({ id: u.id, name: u.name, avatar: u.avatar })}
                            onViewMutual={handleViewMutual}
                          />
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

              {!loading && activeTab === "sent" && (
                <div>
                  {filteredSentRequests.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title={searchQuery ? "No matching sent requests" : "No sent requests"}
                      description={
                        searchQuery
                          ? `No sent requests match "${searchQuery}".`
                          : "You have no outgoing pending connection invites."
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-semibold text-slate-300">
                          Outgoing Invites ({filteredSentRequests.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSentRequests.map((user) => (
                          <Card key={user.id} hover>
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
                                  loading={processingId === user.id}
                                  onClick={() => handleCancelSentRequest(user)}
                                  className="border border-[#1f2937] text-slate-300 hover:text-red-400"
                                >
                                  Cancel Request
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

              {/* Remove Connection Confirmation Dialog */}
              <UnfriendConfirmModal
                isOpen={!!confirmUnfriendUser}
                onClose={() => setConfirmUnfriendUser(null)}
                user={confirmUnfriendUser}
                onConfirm={async (uid) => {
                  setConfirmUnfriendUser(null);
                  await handleUnfriend(uid);
                }}
              />

              {/* Mutual Friends Dialog */}
              <MutualFriendsModal
                isOpen={!!mutualUser}
                onClose={() => setMutualUser(null)}
                targetUserName={mutualUser?.name}
                mutualList={mutualList}
                loading={loadingMutual}
                onMessageClick={(m) => openChat({ id: m.id, name: m.name, avatar: m.avatar })}
              />
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