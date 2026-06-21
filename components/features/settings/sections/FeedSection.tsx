import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingSelect from "@/components/features/settings/SettingSelect";

export default function FeedSection() {
  return (
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
  );
}
