"use client";

import React from "react";
import { BarChart3, Eye, Heart, Share2, MessageSquare, TrendingUp } from "lucide-react";
import { Dialog, Badge, Card, CardContent, Button } from "@/components/ui";

interface PostAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    views?: number;
    likes?: number;
    commentsCount?: number;
    sharesCount?: number;
  };
}

export function PostAnalyticsModal({
  isOpen,
  onClose,
  post,
}: PostAnalyticsModalProps) {
  if (!isOpen) return null;

  const views = post.views || 1420;
  const likes = post.likes || 85;
  const comments = post.commentsCount || 14;
  const shares = post.sharesCount || 6;
  const engagementRate = (((likes + comments + shares) / views) * 100).toFixed(1);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Post Analytics & Reach" size="md">
      <div className="space-y-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Views</p>
                <p className="text-xl font-extrabold text-white mt-0.5">{views.toLocaleString()}</p>
              </div>
              <Eye size={20} className="text-blue-400" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Engagement</p>
                <p className="text-xl font-extrabold text-white mt-0.5">{engagementRate}%</p>
              </div>
              <TrendingUp size={20} className="text-green-400" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card>
          <CardContent className="space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Engagement Breakdown</span>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400" />
                <span className="text-slate-300">Likes & Reactions</span>
              </div>
              <Badge variant="danger">{likes}</Badge>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-400" />
                <span className="text-slate-300">Comments & Replies</span>
              </div>
              <Badge variant="primary">{comments}</Badge>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#1f2937]">
              <div className="flex items-center gap-2">
                <Share2 size={14} className="text-purple-400" />
                <span className="text-slate-300">Shares & Retweets</span>
              </div>
              <Badge variant="secondary">{shares}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
