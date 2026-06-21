"use client";

import React, { useState } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import { useChatStore } from "@/store/chatStore";
import { usePostStore, ConnectionUser } from "@/store/postStore";
import { Users, UserPlus, UserCheck, MessageSquare, Check, X, Compass, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const initialRequests: ConnectionUser[] = [
  {
    id: "elena",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    role: "Core Infrastructure Lead",
    mutual: 8,
  },
  {
    id: "davidk",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1780764895105-ea3037466236?q=80&w=100&auto=format&fit=crop",
    role: "Digital Artist & Photographer",
    mutual: 12,
  },
];

const initialSuggestions: ConnectionUser[] = [
  {
    id: "marcus",
    name: "Marcus Aurelius",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    role: "Systems Philosopher",
    mutual: 2,
  },
  {
    id: "ada",
    name: "Ada Lovelace",
    avatar: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100",
    role: "First Compiler Dev",
    mutual: 18,
  },
];

const initialCurrentConnections: ConnectionUser[] = [
  {
    id: "sarahc",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1780570589435-059359e813cc?q=80&w=100&auto=format&fit=crop",
    role: "Fluid Systems Designer",
    mutual: 15,
  },
];


export default function ConnectionsPage() {
  const { openChat } = useChatStore();
  const { connectionRequests, acceptRequest, declineRequest } = usePostStore();
  const [suggestions, setSuggestions] = useState<ConnectionUser[]>(initialSuggestions);
  const [connections, setConnections] = useState<ConnectionUser[]>(initialCurrentConnections);
  const [activeTab, setActiveTab] = useState<"requests" | "suggestions" | "connections">("requests");

  const handleAcceptRequest = (user: ConnectionUser) => {
    acceptRequest(user.id);
    setConnections([user, ...connections]);
  };

  const handleDeclineRequest = (userId: string) => {
    declineRequest(userId);
  };

  const handleAddFriend = (user: ConnectionUser) => {
    setSuggestions(suggestions.filter((s) => s.id !== user.id));
    setConnections([user, ...connections]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="flex">
        {/* LEFT SIDEBAR */}
        <aside className="w-72 shrink-0">
          <LeftSidebar />
        </aside>

        {/* MAIN FEED */}
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-3xl px-6 py-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#1f2937] pb-4">
              <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400">
                <Users size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Connections Hub</h1>
                <p className="text-xs text-slate-400">Manage your developer network and connection invites</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#1f2937]/60 flex gap-6">
              {[
                { id: "requests", label: "Requests", count: connectionRequests.length },
                { id: "suggestions", label: "Suggestions", count: suggestions.length },
                { id: "connections", label: "Your Connections", count: connections.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      pb-3 px-1 text-xs font-bold transition-all relative border-b-2 flex items-center gap-1.5
                      ${isActive ? "border-blue-500 text-blue-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"}
                    `}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Content Lists */}
            <div className="space-y-4">
              {activeTab === "requests" && (
                <div className="space-y-4">
                  {connectionRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                      <p className="text-slate-400 font-semibold text-sm">No pending connection requests</p>
                      <p className="text-xs text-slate-500 max-w-xs">When people invite you to connect, they will show up here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connectionRequests.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 flex flex-col justify-between space-y-4">
                          <Link href={`/profile/${user.id}`} className="flex items-start gap-3 hover:opacity-90 transition">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-[#1f2937] bg-[#0f172a]">
                              <Image src={user.avatar} fill className="object-cover" alt={user.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{user.role}</p>
                              <p className="text-[9px] text-slate-500 mt-1 font-semibold">{user.mutual} mutual connections</p>
                            </div>
                          </Link>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleAcceptRequest(user)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              onClick={() => handleDeclineRequest(user.id)}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-[#1f2937] font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                            >
                              <X size={14} /> Ignore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "suggestions" && (
                <div className="space-y-4">
                  {suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                      <p className="text-slate-400 font-semibold text-sm">No new suggestions</p>
                      <p className="text-xs text-slate-500 max-w-xs">We couldn't find any suggestions for you right now.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestions.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 flex flex-col justify-between space-y-4">
                          <Link href={`/profile/${user.id}`} className="flex items-start gap-3 hover:opacity-90 transition">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-[#1f2937] bg-[#0f172a]">
                              <Image src={user.avatar} fill className="object-cover" alt={user.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{user.role}</p>
                              <p className="text-[9px] text-slate-500 mt-1 font-semibold">{user.mutual} mutual connections</p>
                            </div>
                          </Link>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handleAddFriend(user)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                            >
                              <UserPlus size={14} /> Connect
                            </button>
                            <button
                              onClick={() => openChat({ id: user.id, name: user.name, avatar: user.avatar })}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-[#1f2937] p-2 rounded-xl transition flex items-center justify-center shrink-0"
                              title="Send Message"
                            >
                              <MessageSquare size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "connections" && (
                <div className="space-y-4">
                  {connections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-2xl border border-dashed border-[#1f2937] bg-[#111827]/40">
                      <p className="text-slate-400 font-semibold text-sm">No connections yet</p>
                      <p className="text-xs text-slate-500 max-w-xs">Start connecting with other developers to build your network.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {connections.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4 flex flex-col justify-between space-y-4">
                          <Link href={`/profile/${user.id}`} className="flex items-start gap-3 hover:opacity-90 transition">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden shrink-0 border border-[#1f2937] bg-[#0f172a]">
                              <Image src={user.avatar} fill className="object-cover" alt={user.name} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white leading-tight">{user.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{user.role}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-green-400 font-semibold">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                <span>Connected</span>
                              </div>
                            </div>
                          </Link>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => openChat({ id: user.id, name: user.name, avatar: user.avatar })}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10"
                            >
                              <MessageSquare size={14} /> Message
                            </button>
                            <button
                              onClick={() => {
                                setConnections(connections.filter((c) => c.id !== user.id));
                                setSuggestions([user, ...suggestions]);
                              }}
                              className="bg-slate-800 hover:bg-red-500/10 text-red-400 border border-red-500/10 px-3 py-2 rounded-xl text-xs transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="w-80 shrink-0">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
