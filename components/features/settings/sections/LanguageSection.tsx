import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingSelect from "@/components/features/settings/SettingSelect";

export default function LanguageSection() {
  return (
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
  );
}
