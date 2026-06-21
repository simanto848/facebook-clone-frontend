import { Bell, Lock, Palette, Shield, User } from "lucide-react";

const menuItems = [
  {
    icon: User,
    label: "Account",
  },
  {
    icon: Bell,
    label: "Notifications",
  },
  {
    icon: Shield,
    label: "Privacy",
  },
  {
    icon: Lock,
    label: "Security",
  },
  {
    icon: Palette,
    label: "Appearance",
  },
];

export default function SettingsSidebar() {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-4">
      <h2 className="mb-5 text-lg font-semibold text-white">Settings</h2>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className="
                flex w-full items-center gap-3
                rounded-xl px-4 py-3
                text-slate-300
                transition
                hover:bg-[#1f2937]
              "
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
