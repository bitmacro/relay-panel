"use client";

import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  kindBadgeMeta,
  dashboardKindLongDescription,
  HELP_REFERENCE_KINDS,
} from "@/lib/events-display";

function CopyBlock({ label, text }: { label: string; text: string }) {
  const t = useTranslations("common");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-[11px] text-[#f7931a] hover:underline"
        >
          {t("copy")}
        </button>
      </div>
      <pre className="text-[11px] font-mono bg-secondary border border-border rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all">
        {text}
      </pre>
    </div>
  );
}

const STRFRY_SNIPPETS: { key: string; cmd: string }[] = [
  {
    key: "scan",
    cmd: "docker exec -it relay_public strfry scan",
  },
  {
    key: "req",
    cmd: 'docker exec -it relay_public strfry router /tmp/req.json',
  },
  {
    key: "compact",
    cmd: "docker exec -it relay_public strfry compact",
  },
];

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
  const t = useTranslations("help");
  const tCmd = useTranslations("help.cmd");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <p className="text-[13px] text-muted-foreground font-normal">
            {t("intro")}
          </p>
        </SheetHeader>
        <div className="px-6 pb-8 space-y-6 text-[13px]">
          <div className="space-y-2">
            <a
              href="https://bitmacro.io/relay-manager/docs"
              target="_blank"
              rel="noreferrer"
              className="block text-[#f7931a] hover:underline"
            >
              {t("mainDocs")}
            </a>
            <a
              href="https://relay-panel.bitmacro.io"
              target="_blank"
              rel="noreferrer"
              className="block text-[#f7931a] hover:underline"
            >
              {t("panelLanding")}
            </a>
            <a
              href="https://github.com/bitmacro/relay-panel/issues"
              target="_blank"
              rel="noreferrer"
              className="block text-[#f7931a] hover:underline"
            >
              {t("reportIssue")}
            </a>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold text-foreground mb-2 uppercase tracking-wide">
              {t("kindRef")}
            </h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">
                      Kind
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">
                      Label
                    </th>
                    <th className="text-left px-2 py-1.5 font-medium text-muted-foreground">
                      —
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HELP_REFERENCE_KINDS.map((k) => {
                    const meta = kindBadgeMeta(k);
                    return (
                      <tr key={k} className="border-b border-border last:border-0">
                        <td className="px-2 py-1.5 font-mono tabular-nums">{k}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-muted-foreground leading-snug">
                          {dashboardKindLongDescription(k)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-[12px] font-semibold text-foreground mb-3 uppercase tracking-wide">
              {t("commandsSection")}
            </h3>
            <div className="space-y-4">
              <CopyBlock
                label={tCmd("dockerPs")}
                text="docker ps --filter name=relay_"
              />
              {STRFRY_SNIPPETS.map((s) => (
                <CopyBlock
                  key={s.key}
                  label={tCmd(s.key as "scan" | "req" | "compact")}
                  text={s.cmd}
                />
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
