"use client";

import { useCallback, useState } from "react";
import { Check, ClipboardCopy, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export interface BearerSecretInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "value" | "onChange" | "className"
  > {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Merged with base field styles (padding-end reserved for actions). */
  inputClassName?: string;
  className?: string;
}

export function BearerSecretInput({
  value,
  onChange,
  inputClassName,
  className,
  disabled,
  ...rest
}: BearerSecretInputProps) {
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [value]);

  return (
    <div className={cn("relative w-full", className)}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "min-h-10 w-full rounded-md border border-border bg-secondary py-2 pl-3 pr-[4.75rem] text-[13px] font-mono text-foreground outline-none focus:border-[#f7931a] disabled:opacity-50",
          inputClassName
        )}
      />
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
        <button
          type="button"
          onClick={copy}
          disabled={disabled || !value}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          aria-label={t("copy")}
          title={t("copy")}
        >
          {copied ? (
            <Check className="size-4 text-[#22c55e]" aria-hidden />
          ) : (
            <ClipboardCopy className="size-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          aria-label={visible ? t("hideSecret") : t("showSecret")}
          title={visible ? t("hideSecret") : t("showSecret")}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
