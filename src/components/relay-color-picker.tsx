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
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {RELAY_COLOR_PRESETS.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            className={`h-6 w-6 rounded-full border-2 transition-opacity hover:opacity-80 ${
              value === hex
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-muted-foreground/50"
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
            className="w-20 rounded-md border border-input bg-background px-2 py-1 text-[11px] font-mono text-foreground placeholder:text-muted-foreground shadow-sm"
          />
          {value && (
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: isValidHex ? value : "var(--border)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
