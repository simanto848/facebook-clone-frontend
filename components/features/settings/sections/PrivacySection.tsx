import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingSelect from "@/components/features/settings/SettingSelect";
import SettingToggle from "@/components/features/settings/SettingToggle";

export default function PrivacySection() {
  return (
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
  );
}
