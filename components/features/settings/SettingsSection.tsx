interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function SettingsSection({
  title,
  description,
  children,
}: Props) {
  return (
    <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {description && (
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}
