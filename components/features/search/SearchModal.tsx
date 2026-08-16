"use client";

import React, { useState, useEffect } from "react";
import { Search, User, FileText, Users, Flag, Hash } from "lucide-react";
import { Dialog, Input, Tabs, Avatar, Badge, Loader, EmptyState } from "@/components/ui";
import { searchService } from "@/services/searchService";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchService.search(query, activeTab as any);
        const items = res?.data || res || [];
        setResults(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Search modal error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" title="Search Community">
      <div className="space-y-4">
        <Input
          placeholder="Search developers, posts, guilds, hashtags..."
          leftIcon={<Search size={18} />}
          clearable
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <Tabs
          tabs={[
            { id: "all", label: "All" },
            { id: "users", label: "People" },
            { id: "posts", label: "Posts" },
            { id: "groups", label: "Guilds" },
            { id: "hashtags", label: "Hashtags" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pills"
        />

        <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {loading ? (
            <div className="py-12 text-center">
              <Loader label="Searching..." />
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title={query ? "No search results found" : "Type to search"}
              description={query ? "Try a different search query or topic tag." : "Search across developers, posts, and community guilds."}
            />
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-[#1f2937] bg-[#111827] hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={item.avatar || item.author?.avatar} name={item.name || item.title || "Result"} size="md" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{item.name || item.title || item.username}</p>
                    <p className="text-[10px] text-slate-400 truncate">{item.bio || item.content || item.category || "Search Result"}</p>
                  </div>
                </div>

                <Badge variant="primary" size="sm">
                  {item.type || "Match"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
