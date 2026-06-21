import { Bell, Lock, Palette, Shield, User, Globe, Rss } from "lucide-react";

export const menuItems = [
  {
    icon: User,
    label: "Account",
    id: "account",
  },
  {
    icon: Bell,
    label: "Notifications",
    id: "notifications",
  },
  {
    icon: Shield,
    label: "Privacy",
    id: "privacy",
  },
  {
    icon: Lock,
    label: "Security",
    id: "security",
  },
  {
    icon: Palette,
    label: "Appearance",
    id: "appearance",
  },
  {
    icon: Globe,
    label: "Language & Region",
    id: "language",
  },
  {
    icon: Rss,
    label: "Feed Preferences",
    id: "feed",
  },
];

interface SettingsSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4">
      <h2 className="mb-5 text-lg font-semibold text-white">Settings</h2>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex w-full items-center gap-3
                rounded-xl px-4 py-3
                transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white font-medium shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-[#1f2937] hover:text-white"
                }
              `}
            >
              <Icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

