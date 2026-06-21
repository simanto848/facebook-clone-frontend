interface Props {
  label: string;
  value?: string;
  type?: string;
}

export default function SettingInput({ label, value, type = "text" }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>

      <input
        type={type}
        defaultValue={value}
        className="
          w-full rounded-xl
          border border-[#1f2937]
          bg-[#0f172a]
          px-4 py-3
          text-white
          outline-none
        "
      />
    </div>
  );
}
