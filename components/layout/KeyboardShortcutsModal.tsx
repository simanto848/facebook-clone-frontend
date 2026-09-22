"use client";

import React from "react";
import { Dialog } from "@/components/ui";
import { Command, Compass, Home, MessageSquare, Bell, Settings, User, Users, Film } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  icon?: React.ReactNode;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const navigationShortcuts: ShortcutItem[] = [
    { keys: ["G", "H"], description: "Home Feed", icon: <Home size={14} className="text-blue-400" /> },
    { keys: ["G", "E"], description: "Explore", icon: <Compass size={14} className="text-purple-400" /> },
    { keys: ["G", "R"], description: "Reels", icon: <Film size={14} className="text-rose-400" /> },
    { keys: ["G", "P"], description: "Your Profile", icon: <User size={14} className="text-emerald-400" /> },
    { keys: ["G", "C"], description: "Connections Hub", icon: <Users size={14} className="text-amber-400" /> },
    { keys: ["G", "M"], description: "Messages", icon: <MessageSquare size={14} className="text-teal-400" /> },
    { keys: ["G", "N"], description: "Notifications", icon: <Bell size={14} className="text-indigo-400" /> },
    { keys: ["G", "S"], description: "Settings", icon: <Settings size={14} className="text-slate-400" /> },
  ];

  const generalShortcuts: ShortcutItem[] = [
    { keys: ["?"], description: "Open / Close this shortcuts guide" },
    { keys: ["Esc"], description: "Close modal / dismiss dialog" },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Command size={16} />
          </div>
          <span>Keyboard Shortcuts</span>
        </div>
      }
      description="Quickly navigate and control your workspace with keyboard bindings."
      size="md"
    >
      <div className="space-y-4 pt-1">
        {/* Navigation Section */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Navigation (Press G then Key)
          </h4>
          <div className="space-y-1.5">
            {navigationShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0f172a] border border-[#1f2937]/70 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span className="text-xs text-slate-200">{item.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-2 py-0.5 min-w-[22px] text-center rounded-md bg-[#1f2937] border border-slate-700 font-mono text-[11px] font-semibold text-slate-200 shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* General Section */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            General
          </h4>
          <div className="space-y-1.5">
            {generalShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0f172a] border border-[#1f2937]/70"
              >
                <span className="text-xs text-slate-200">{item.description}</span>
                <div className="flex items-center gap-1">
                  {item.keys.map((k, kIdx) => (
                    <kbd
                      key={kIdx}
                      className="px-2 py-0.5 min-w-[22px] text-center rounded-md bg-[#1f2937] border border-slate-700 font-mono text-[11px] font-semibold text-slate-200 shadow-xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300/80 leading-relaxed">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-700/50 font-mono text-[10px] text-white">?</kbd> anywhere outside of a text field to toggle this menu.
        </div>
      </div>
    </Dialog>
  );
}
