interface Props {
  title: string;
  description: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
}

export default function SettingToggle({
  title,
  description,
  checked,
  onChange,
  defaultChecked = true,
}: Props) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <h4 className="text-white text-xs font-semibold">{title}</h4>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center shrink-0 ml-4">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          onChange={(e) => onChange?.(e.target.checked)}
        />

        <div
          className="
            h-6 w-11 rounded-full
            bg-[#1f2937]
            peer-checked:bg-blue-500
            after:absolute
            after:left-0.5
            after:top-0.5
            after:h-5
            after:w-5
            after:rounded-full
            after:bg-white
            after:transition-all
            peer-checked:after:translate-x-5
          "
        />
      </label>
    </div>
  );
}
