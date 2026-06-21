import SettingsSection from "@/components/features/settings/SettingsSection";

export default function SecuritySection() {
  return (
    <SettingsSection
      title="Security"
      description="Protect your account."
    >
      <div className="space-y-4">
        <button className="rounded-xl bg-blue-500 px-5 py-3 text-white transition hover:bg-blue-600">
          Change Password
        </button>

        <button className="rounded-xl border border-red-500 px-5 py-3 text-red-400 transition hover:bg-red-500/10">
          Delete Account
        </button>
      </div>
    </SettingsSection>
  );
}
