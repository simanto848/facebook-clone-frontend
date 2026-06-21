interface Props {
  title: string;
  description: string;
}

export default function SettingToggle({ title, description }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-white">{title}</h4>

        <p className="text-sm text-slate-400">{description}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" defaultChecked />

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
