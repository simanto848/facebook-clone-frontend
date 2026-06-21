import SettingInput from "@/components/features/settings/SettingInput";
import SettingsSection from "@/components/features/settings/SettingsSection";

export default function AccountSection() {
  return (
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
  );
}
