"use client";

import React, { useState, useEffect } from "react";
import { Search, User, FileText, Users, Flag, Hash, Clock, X, Trash2, ArrowUpRight } from "lucide-react";
import { Dialog, Input, Tabs, Avatar, Badge, Loader, EmptyState } from "@/components/ui";
import { searchService } from "@/services/searchService";
import Link from "next/link";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_RECENT = ["Next.js 19", "React Conf", "Sarah Chen", "WebGL Shaders", "TailwindCSS"];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_search_queries");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        setRecentSearches(DEFAULT_RECENT);
      }
    } catch {
      setRecentSearches(DEFAULT_RECENT);
    }
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("recent_search_queries", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      try {
        localStorage.setItem("recent_search_queries", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("recent_search_queries");
    } catch {}
  };

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
        saveRecentSearch(query);
      } catch (err) {
        console.error("Search modal error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const getResultHref = (item: any) => {
    if (item.username || item.type === "users" || item.type === "user") {
      return `/profile/${item.username || item.id}`;
    }
    if (item.type === "posts" || item.type === "post") {
      return `/post/${item.id}`;
    }
    if (item.type === "groups" || item.type === "group") {
      return `/groups/${item.id}`;
    }
    if (item.type === "hashtags" || item.type === "hashtag") {
      const tag = (item.name || item.title || "").replace(/^#/, "");
      return `/hashtag/${encodeURIComponent(tag)}`;
    }
    return `/explore`;
  };

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

        {/* Recent Searches Section (when query is empty) */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="space-y-2 pt-1 pb-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" /> Recent Searches
              </span>
              <button
                type="button"
                onClick={clearAllRecent}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                Clear History
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <div
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1f2937] hover:bg-[#374151] border border-[#374151] text-xs text-slate-200 transition cursor-pointer group"
                >
                  <Search size={11} className="text-slate-400 group-hover:text-blue-400" />
                  <span>{term}</span>
                  <button
                    type="button"
                    onClick={(e) => removeRecentSearch(term, e)}
                    className="p-0.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <Link
                key={item.id || idx}
                href={getResultHref(item)}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl border border-[#1f2937] bg-[#111827] hover:border-blue-500/40 hover:bg-[#1a2333] transition group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={item.avatar || item.author?.avatar} name={item.name || item.title || "Result"} size="md" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white group-hover:text-blue-400 transition truncate">
                      {item.name || item.title || item.username}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.bio || item.content || item.category || "Search Result"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="primary" size="sm">
                    {item.type || "Match"}
                  </Badge>
                  <ArrowUpRight size={14} className="text-slate-500 group-hover:text-blue-400 transition" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Dialog>
  );
}
