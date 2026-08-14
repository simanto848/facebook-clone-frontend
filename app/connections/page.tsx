"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useChatStore } from "@/store/chatStore";
import { Users, UserPlus, MessageSquare, Check, X, UserX } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRequest = async (user: DisplayUser) => {
    try {
      await friendshipService.acceptFriendRequest(user.id);
      setRequests((prev) => prev.filter((r) => r.id !== user.id));
      setConnections((prev) => [user, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineRequest = async (userId: string) => {
    try {
      await friendshipService.declineFriendRequest(userId);
      setRequests((prev) => prev.filter((r) => r.id !== userId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFriend = async (user: DisplayUser) => {
    try {
      await friendshipService.sendFriendRequest(user.id);
      setSuggestions((prev) => prev.filter((s) => s.id !== user.id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      await friendshipService.unfriend(userId);
      setConnections((prev) => prev.filter((c) => c.id !== userId));
    } catch (e) {
      console.error(e);
    }
  };

  const tabItems = [
    { id: "requests", label: "Requests", badge: requests.length },
    { id: "suggestions", label: "Suggestions", badge: suggestions.length },
    { id: "connections", label: "Your Connections", badge: connections.length },
  ];

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
            />

            <Tabs
              tabs={tabItems}
              activeTab={activeTab}
              onChange={setActiveTab}
              variant="line"
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
                  {requests.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title="No pending requests"
                      description="When developers send you connection requests, they will show up here."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requests.map((user) => (
                        <Card key={user.id} hover>
                          <CardContent className="space-y-4">
                            <Link href={`/profile/${user.id}`} className="flex items-start gap-3 group">
                              <Avatar src={user.avatar} name={user.name} size="lg" />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user.role}</p>
                                <Badge variant="secondary" size="sm">
                                  {user.mutual} mutual connections
                                </Badge>
                              </div>
                            </Link>

                            <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
                              <Button
                                variant="primary"
                                fullWidth
                                size="sm"
                                leftIcon={<Check size={14} />}
                                onClick={() => handleAcceptRequest(user)}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="secondary"
                                fullWidth
                                size="sm"
                                leftIcon={<X size={14} />}
                                onClick={() => handleDeclineRequest(user.id)}
                              >
                                Ignore
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!loading && activeTab === "suggestions" && (
                <div>
                  {suggestions.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title="No new suggestions"
                      description="Check back later for new recommended connections."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestions.map((user) => (
                        <Card key={user.id} hover>
                          <CardContent className="space-y-4">
                            <Link href={`/profile/${user.id}`} className="flex items-start gap-3 group">
                              <Avatar src={user.avatar} name={user.name} size="lg" />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user.role}</p>
                                <Badge variant="outline" size="sm">
                                  {user.mutual} mutual connections
                                </Badge>
                              </div>
                            </Link>

                            <div className="flex gap-2 pt-2 border-t border-[#1f2937]/60">
                              <Button
                                variant="primary"
                                fullWidth
                                size="sm"
                                leftIcon={<UserPlus size={14} />}
                                onClick={() => handleAddFriend(user)}
                              >
                                Connect
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
                  {connections.length === 0 ? (
                    <EmptyState
                      icon={<Users size={32} className="text-slate-400" />}
                      title="No connections yet"
                      description="Start connecting with other developers to build your network."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connections.map((user) => (
                        <Card key={user.id} hover>
                          <CardContent className="space-y-4">
                            <Link href={`/profile/${user.id}`} className="flex items-start gap-3 group">
                              <Avatar src={user.avatar} name={user.name} size="lg" online />
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate">{user.role}</p>
                                <Badge variant="success" size="sm" pulse>
                                  Connected
                                </Badge>
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
                                onClick={() => handleUnfriend(user.id)}
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