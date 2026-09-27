"use client";

import React, { useState, useEffect } from "react";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingToggle from "@/components/features/settings/SettingToggle";
import { Select, Button, Badge } from "@/components/ui";
import { Star, Clock, EyeOff, Film, ShieldAlert, Check, Plus, Trash2, RotateCcw } from "lucide-react";

interface FavoriteAccount {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

const DEFAULT_FAVORITES: FavoriteAccount[] = [
  { id: "fav-1", name: "Alex Morgan", handle: "@alex", avatar: "https://images.unsplash.com/photo-1779040622687-42bb00790c67?w=100" },
  { id: "fav-2", name: "Sarah Chen", handle: "@sarahc", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
];

const DEFAULT_SNOOZED = [
  { id: "snz-1", name: "Tech Buzz Global", daysLeft: 18 },
];

export default function FeedSection() {
  const [feedMode, setFeedMode] = useState("latest");
  const [autoplayVideo, setAutoplayVideo] = useState("wifi");
  const [reduceLowQuality, setReduceLowQuality] = useState(true);
  const [reduceSensitive, setReduceSensitive] = useState(true);
  const [reduceUnoriginal, setReduceUnoriginal] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteAccount[]>(DEFAULT_FAVORITES);
  const [snoozed, setSnoozed] = useState(DEFAULT_SNOOZED);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("feed_preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.feedMode) setFeedMode(parsed.feedMode);
        if (parsed.autoplayVideo) setAutoplayVideo(parsed.autoplayVideo);
        if (parsed.reduceLowQuality !== undefined) setReduceLowQuality(parsed.reduceLowQuality);
        if (parsed.reduceSensitive !== undefined) setReduceSensitive(parsed.reduceSensitive);
        if (parsed.reduceUnoriginal !== undefined) setReduceUnoriginal(parsed.reduceUnoriginal);
        if (parsed.favorites) setFavorites(parsed.favorites);
        if (parsed.snoozed) setSnoozed(parsed.snoozed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSavePreferences = () => {
    const prefs = {
      feedMode,
      autoplayVideo,
      reduceLowQuality,
      reduceSensitive,
      reduceUnoriginal,
      favorites,
      snoozed,
    };
    try {
      localStorage.setItem("feed_preferences", JSON.stringify(prefs));
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUnsnooze = (id: string) => {
    setSnoozed((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Feed Preferences & Algorithm"
        description="Customize your default newsfeed sorting algorithm and prioritize people or content you care about."
      >
        <div className="space-y-6 max-w-xl">
          {/* Default Feed View */}
          <div>
            <Select
              label="Default Feed View"
              value={feedMode}
              onChange={(e) => setFeedMode(e.target.value)}
              options={[
                { label: "Latest Posts (Chronological)", value: "latest" },
                { label: "Most Popular & Trending", value: "popular" },
                { label: "Favorites First (Prioritized)", value: "favorites" },
                { label: "Recommended for You", value: "recommended" },
              ]}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Select which order you want your main timeline feed to load upon launch.
            </p>
          </div>

          {/* Autoplay Videos */}
          <div>
            <Select
              label="Autoplay Videos"
              value={autoplayVideo}
              onChange={(e) => setAutoplayVideo(e.target.value)}
              options={[
                { label: "Always Autoplay (Sound Muted)", value: "always" },
                { label: "Wi-Fi Connections Only", value: "wifi" },
                { label: "Never Autoplay Videos", value: "never" },
              ]}
            />
          </div>

          {/* Favorites List */}
          <div className="pt-4 border-t border-[#1f2937] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Favorites ({favorites.length})</h4>
              </div>
              <span className="text-[10px] text-slate-400">Prioritized at top of feed</span>
            </div>

            <div className="space-y-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src={fav.avatar} alt={fav.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-white">{fav.name}</p>
                      <p className="text-[10px] text-slate-400">{fav.handle}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFavorite(fav.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Snoozed Content */}
          <div className="pt-4 border-t border-[#1f2937] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Snoozed Accounts</h4>
              </div>
              <span className="text-[10px] text-slate-400">Temporarily hidden for 30 days</span>
            </div>

            {snoozed.length === 0 ? (
              <p className="text-xs text-slate-500 py-1">No snoozed accounts or pages.</p>
            ) : (
              <div className="space-y-2">
                {snoozed.map((snz) => (
                  <div key={snz.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <p className="text-xs font-semibold text-white">{snz.name}</p>
                      <p className="text-[10px] text-slate-400">{snz.daysLeft} days remaining</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUnsnooze(snz.id)}
                    >
                      Unsnooze
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Reduction Toggles */}
          <div className="pt-4 border-t border-[#1f2937] space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reduce Content in Feed</h4>

            <SettingToggle
              title="Reduce Low-Quality Content"
              description="Downrank clickbait headlines, sensationalized updates, and engagement bait."
              checked={reduceLowQuality}
              onChange={setReduceLowQuality}
            />

            <SettingToggle
              title="Reduce Sensitive Content"
              description="Filter sexually suggestive content, violence, and sensitive discussion topics."
              checked={reduceSensitive}
              onChange={setReduceSensitive}
            />

            <SettingToggle
              title="Reduce Unoriginal Content"
              description="Lower visibility of reposted content without original commentary or value."
              checked={reduceUnoriginal}
              onChange={setReduceUnoriginal}
            />
          </div>

          {/* Save Action */}
          <div className="pt-4 border-t border-[#1f2937] flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              leftIcon={saveToast ? <Check size={14} /> : undefined}
              onClick={handleSavePreferences}
            >
              {saveToast ? "Saved Successfully!" : "Save Feed Preferences"}
            </Button>
            {saveToast && (
              <span className="text-xs text-emerald-400 font-medium animate-in fade-in">
                Preferences saved!
              </span>
            )}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
