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
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Profile Header">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full h-20 rounded-xl border border-[#374151] bg-[#1f2937] p-3 text-xs text-white outline-none resize-none focus:border-blue-500"
          />
        </div>

        <Input
          label="Avatar Photo URL"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <Input
          label="Cover Banner URL"
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
