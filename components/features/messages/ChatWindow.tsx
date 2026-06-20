"use client";

import {
  ImageIcon,
  Info,
  Paperclip,
  Phone,
  Search,
  SendHorizontal,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ChatInfoPanel from "./ChatInfoPanel";

export default function ChatWindow() {
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  return (
    <div className="flex h-full bg-[#111827]">
      <div className="flex flex-1 flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#1f2937] px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                alt="Sarah Wilson"
                fill
                className="object-cover"
              />

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-green-500" />
            </div>

            {/* User Info */}
            <div>
              <h2 className="font-semibold text-white">Sarah Wilson</h2>

              <p className="text-sm text-green-400">Active now</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Search size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Phone size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 transition hover:bg-[#263247] hover:text-white">
              <Video size={18} />
            </button>

            <button
              onClick={() => setShowInfoPanel(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f2937] text-slate-400 hover:bg-[#263247] hover:text-white transition"
            >
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Date */}
          <div className="mb-8 flex justify-center">
            <span className="rounded-full bg-[#1f2937] px-4 py-1 text-xs text-slate-400">
              Today
            </span>
          </div>

          <div className="space-y-5">
            {/* Incoming */}
            <div className="flex items-end gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>

              <div className="max-w-md rounded-2xl rounded-bl-md bg-[#1f2937] px-4 py-3 text-white">
                Hi Alex! How's the social media app going?
              </div>
            </div>

            {/* Outgoing */}
            <div className="flex justify-end">
              <div className="max-w-md rounded-2xl rounded-br-md bg-[#3b82f6] px-4 py-3 text-white">
                Going great 🚀. Just finished the profile page.
              </div>
            </div>

            {/* Incoming */}
            <div className="flex items-end gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>

              <div className="max-w-md rounded-2xl rounded-bl-md bg-[#1f2937] px-4 py-3 text-white">
                Nice! Did you implement the messaging page yet?
              </div>
            </div>

            {/* Outgoing */}
            <div className="flex justify-end">
              <div className="max-w-md rounded-2xl rounded-br-md bg-[#3b82f6] px-4 py-3 text-white">
                Working on it now 😄
              </div>
            </div>

            {/* Incoming */}
            <div className="flex items-end gap-3">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300"
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>

              <div className="max-w-md rounded-2xl rounded-bl-md bg-[#1f2937] px-4 py-3 text-white">
                Can't wait to see it 🔥
              </div>
            </div>
          </div>
        </div>

        {/* INPUT */}
        <div className="border-t border-[#1f2937] p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#1f2937] p-3">
            <button className="text-slate-400 transition hover:text-white">
              <Paperclip size={20} />
            </button>

            <button className="text-slate-400 transition hover:text-white">
              <ImageIcon size={20} />
            </button>

            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
            />

            <button className="rounded-xl bg-blue-500 p-2 text-white transition hover:bg-blue-600">
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Info Sidebar or Panel */}
      {showInfoPanel && (
        <ChatInfoPanel onClose={() => setShowInfoPanel(false)} />
      )}
    </div>
  );
}
