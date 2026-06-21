import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingSelect from "@/components/features/settings/SettingSelect";

export default function AppearanceSection() {
  return (
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
  );
}
