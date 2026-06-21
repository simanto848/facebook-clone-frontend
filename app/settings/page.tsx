import SettingInput from "@/components/features/settings/SettingInput";
import SettingSelect from "@/components/features/settings/SettingSelect";
import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingsSidebar from "@/components/features/settings/SettingsSidebar";
import SettingToggle from "@/components/features/settings/SettingToggle";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-white">Settings</h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <SettingsSidebar />
          </div>

          {/* Content */}
          <div className="col-span-9 space-y-6">
            {/* Account Information */}
            <SettingsSection
              title="Account Information"
              description="Manage your profile details."
            >
              <div className="grid grid-cols-2 gap-4">
                <SettingInput label="Full Name" value="Simanto Hasan" />

                <SettingInput label="Username" value="simanto" />

                <SettingInput
                  label="Email"
                  value="simanto@example.com"
                  type="email"
                />

                <SettingInput label="Phone Number" value="+880 1712-345678" />
              </div>
            </SettingsSection>

            {/* Appearance */}
            <SettingsSection
              title="Appearance"
              description="Customize how Your World looks."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="Theme"
                  description="Choose your preferred theme."
                  defaultValue="dark"
                  options={[
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                    { label: "System", value: "system" },
                  ]}
                />

                <SettingSelect
                  label="Font Size"
                  defaultValue="medium"
                  options={[
                    { label: "Small", value: "small" },
                    { label: "Medium", value: "medium" },
                    { label: "Large", value: "large" },
                  ]}
                />
              </div>
            </SettingsSection>

            {/* Language & Region */}
            <SettingsSection
              title="Language & Region"
              description="Manage localization preferences."
            >
              <div className="grid grid-cols-2 gap-4">
                <SettingSelect
                  label="Language"
                  defaultValue="en"
                  options={[
                    { label: "English", value: "en" },
                    { label: "বাংলা", value: "bn" },
                    { label: "Hindi", value: "hi" },
                  ]}
                />

                <SettingSelect
                  label="Timezone"
                  defaultValue="asia_dhaka"
                  options={[
                    {
                      label: "Asia/Dhaka",
                      value: "asia_dhaka",
                    },
                    {
                      label: "Asia/Kolkata",
                      value: "asia_kolkata",
                    },
                    {
                      label: "UTC",
                      value: "utc",
                    },
                  ]}
                />
              </div>
            </SettingsSection>

            {/* Notifications */}
            <SettingsSection
              title="Notifications"
              description="Control how you receive notifications."
            >
              <div className="space-y-5">
                <SettingToggle
                  title="Push Notifications"
                  description="Receive notifications on your device."
                />

                <SettingToggle
                  title="Email Notifications"
                  description="Receive updates by email."
                />

                <SettingToggle
                  title="Marketing Emails"
                  description="Receive product announcements."
                />
              </div>
            </SettingsSection>

            {/* Privacy */}
            <SettingsSection
              title="Privacy"
              description="Manage your privacy preferences."
            >
              <div className="space-y-5">
                <SettingToggle
                  title="Private Account"
                  description="Only approved followers can see your content."
                />

                <SettingToggle
                  title="Show Online Status"
                  description="Allow others to see when you're online."
                />

                <SettingSelect
                  label="Profile Visibility"
                  defaultValue="public"
                  options={[
                    {
                      label: "Public",
                      value: "public",
                    },
                    {
                      label: "Friends Only",
                      value: "friends",
                    },
                    {
                      label: "Private",
                      value: "private",
                    },
                  ]}
                />
              </div>
            </SettingsSection>

            {/* Feed Preferences */}
            <SettingsSection
              title="Feed Preferences"
              description="Customize your feed experience."
            >
              <SettingSelect
                label="Default Feed"
                defaultValue="latest"
                options={[
                  {
                    label: "Latest",
                    value: "latest",
                  },
                  {
                    label: "Most Popular",
                    value: "popular",
                  },
                  {
                    label: "Recommended",
                    value: "recommended",
                  },
                ]}
              />
            </SettingsSection>

            {/* Security */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
