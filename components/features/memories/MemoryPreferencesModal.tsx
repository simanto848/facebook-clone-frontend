import React, { useState } from "react";
import { UserX, Plus, X, CalendarX, EyeOff, Calendar } from "lucide-react";
import { Dialog, Button } from "@/components/ui";

export type NotificationLevel = "all" | "highlights" | "none";

export interface MemoryPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hiddenPeople: string[];
  onAddHiddenPerson: (name: string) => void;
  onRemoveHiddenPerson: (name: string) => void;
  availableYears: number[];
  hiddenYears: string[];
  onToggleHiddenYear: (year: string) => void;
  notificationLevel: NotificationLevel;
  onNotificationLevelChange: (level: NotificationLevel) => void;
}

export default function MemoryPreferencesModal({
  isOpen,
  onClose,
  hiddenPeople,
  onAddHiddenPerson,
  onRemoveHiddenPerson,
  availableYears,
  hiddenYears,
  onToggleHiddenYear,
  notificationLevel,
  onNotificationLevelChange,
}: MemoryPreferencesModalProps) {
  const [newPersonInput, setNewPersonInput] = useState("");

  const handleAdd = () => {
    if (!newPersonInput.trim()) return;
    onAddHiddenPerson(newPersonInput.trim());
    setNewPersonInput("");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Memories Preferences"
      description="Choose who or what dates you don't want to see in your On This Day memories."
    >
      <div className="space-y-5">
        {/* Hide People Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hide People
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Memories featuring or created by these people won&apos;t appear in your memories feed.
          </p>

          {/* Input to add person */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a person's name to hide..."
              value={newPersonInput}
              onChange={(e) => setNewPersonInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="flex-1 bg-[#0f172a] border border-[#1f2937] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAdd}
              disabled={!newPersonInput.trim()}
              leftIcon={<Plus size={13} />}
            >
              Hide
            </Button>
          </div>

          {/* Hidden People List */}
          {hiddenPeople.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hiddenPeople.map((person) => (
                <span
                  key={person}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  <span>{person}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveHiddenPerson(person)}
                    className="hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              No people hidden from memories yet.
            </div>
          )}
        </div>

        {/* Hide Dates / Years Section */}
        <div className="space-y-3 pt-3 border-t border-[#1f2937]">
          <div className="flex items-center gap-2">
            <CalendarX size={16} className="text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hide Specific Years
            </h4>
          </div>
          <p className="text-[11px] text-slate-400">
            Toggle specific years you want to skip or exclude from memories.
          </p>
          <div className="flex flex-wrap gap-2">
            {availableYears.map((yr) => {
              const yrStr = String(yr);
              const isHidden = hiddenYears.includes(yrStr);
              return (
                <button
                  key={yrStr}
                  type="button"
                  onClick={() => onToggleHiddenYear(yrStr)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                    isHidden
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-[#0f172a] text-slate-300 hover:text-white border-[#1f2937]"
                  }`}
                >
                  {isHidden ? <EyeOff size={12} /> : <Calendar size={12} />}
                  <span>{yrStr}</span>
                  <span className="text-[10px] text-slate-500">
                    {isHidden ? "(Hidden)" : "(Visible)"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications Level */}
        <div className="space-y-3 pt-3 border-t border-[#1f2937]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Memory Notifications
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "all", label: "All Memories", desc: "Notify daily" },
                { id: "highlights", label: "Highlights", desc: "Special only" },
                { id: "none", label: "None", desc: "No alerts" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onNotificationLevelChange(opt.id)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  notificationLevel === opt.id
                    ? "bg-purple-600/20 border-purple-500/50 text-white"
                    : "bg-[#0f172a] border-[#1f2937] text-slate-400 hover:text-white"
                }`}
              >
                <span className="block text-xs font-semibold text-white">{opt.label}</span>
                <span className="text-[10px] text-slate-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#1f2937]">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
