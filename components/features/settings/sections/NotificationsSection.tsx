import SettingsSection from "@/components/features/settings/SettingsSection";
import SettingToggle from "@/components/features/settings/SettingToggle";

export default function NotificationsSection() {
  return (
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
  );
}
