"use client";

export const RELAY_COLOR_PRESETS = [
  "#22c55e",
  "#3b82f6",
  "#f7931a",
  "#f87171",
  "#a78bfa",
  "#06b6d4",
  "#eab308",
  "#ec4899",
] as const;

interface RelayColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

export function RelayColorPicker({ value, onChange, label = "Cor" }: RelayColorPickerProps) {
  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div>
      <div className="mb-1 text-[11px] text-[#555]">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {RELAY_COLOR_PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            className={`h-6 w-6 rounded-full border-2 transition-opacity hover:opacity-80 ${
              value === hex
                ? "border-[#f7931a] ring-1 ring-[#f7931a]"
                : "border-[#333] hover:border-[#555]"
            }`}
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={value.startsWith("#") ? value : value ? `#${value}` : ""}
            onChange={(e) => {
              const v = e.target.value.trim();
              if (v === "") onChange("");
              else if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
              else if (/^[0-9a-fA-F]{6}$/.test(v)) onChange(`#${v}`);
            }}
            placeholder="#000000"
            className="w-20 rounded border border-[#333] bg-[#141414] px-2 py-1 text-[11px] font-mono text-[#ccc] placeholder:text-[#555]"
          />
          {value && (
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-[#333]"
              style={{ backgroundColor: isValidHex ? value : "#333" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
