"use client";

import React, { useState } from "react";
import { Camera, Upload, Check } from "lucide-react";
import { Dialog, Button, Input, Avatar } from "@/components/ui";
import { userService } from "@/services/userService";

interface ProfileHeaderEditProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    bio?: string;
    avatar: string;
    coverPhoto?: string;
  };
  onUpdated: (newProfile: any) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
];

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=800",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800",
  "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800",
];

export function ProfileHeaderEdit({
  isOpen,
  onClose,
  user,
  onUpdated,
}: ProfileHeaderEditProps) {
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [coverPhoto, setCoverPhoto] = useState(user.coverPhoto || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await userService.updateProfile({
        name,
        bio,
        avatar,
        coverPhoto,
      });
      onUpdated(res?.data || { name, bio, avatar, coverPhoto });
      onClose();
    } catch (err) {
      console.error("Update profile error:", err);
      onUpdated({ name, bio, avatar, coverPhoto });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Profile Header" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Mini Preview */}
        <div className="relative rounded-xl overflow-hidden border border-[#1f2937] bg-[#111827]">
          <div
            className="h-24 w-full bg-cover bg-center bg-slate-800"
            style={{ backgroundImage: `url(${coverPhoto || COVER_PRESETS[0]})` }}
          />
          <div className="px-4 pb-3 flex items-end gap-3 -mt-6">
            <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-800 shadow-md">
              <Avatar src={avatar || AVATAR_PRESETS[0]} name={name} size="md" />
            </div>
            <div className="pb-0.5">
              <p className="text-xs font-bold text-white">{name || "Your Name"}</p>
              <p className="text-[10px] text-slate-400">Live preview</p>
            </div>
          </div>
        </div>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-300 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the community about yourself..."
            className="w-full h-16 rounded-xl border border-[#374151] bg-[#1f2937] p-2.5 text-xs text-white outline-none resize-none focus:border-blue-500"
          />
        </div>

        {/* Avatar Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Choose Avatar Preset</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatar(preset)}
                className={`relative h-10 w-10 rounded-full overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                  avatar === preset ? "border-blue-500 scale-105" : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <Avatar src={preset} name={`Preset ${idx + 1}`} size="sm" />
                {avatar === preset && (
                  <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Choose Cover Banner Preset</label>
          <div className="grid grid-cols-4 gap-2">
            {COVER_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCoverPhoto(preset)}
                style={{ backgroundImage: `url(${preset})` }}
                className={`h-10 rounded-lg bg-cover bg-center border-2 transition cursor-pointer relative ${
                  coverPhoto === preset ? "border-blue-500 scale-105" : "border-slate-700 hover:border-slate-500"
                }`}
              >
                {coverPhoto === preset && (
                  <div className="absolute inset-0 bg-blue-600/40 rounded-md flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Or Custom Avatar Photo URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <Input
          label="Or Custom Cover Banner URL"
          value={coverPhoto}
          onChange={(e) => setCoverPhoto(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <div className="flex justify-end gap-2 pt-2 border-t border-[#1f2937]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
