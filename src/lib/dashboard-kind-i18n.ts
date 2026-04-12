/**
 * Kind badges, long descriptions, and row tooltips for the dashboard (and shared UI).
 * Uses next-intl keys under the `dashboard` namespace.
 */

/** Matches `useTranslations("dashboard")` without importing next-intl types here. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardT = (key: string, values?: Record<string, any>) => string;

export function kindBadgeClass(kind: number): string {
  if (kind === 0)
    return "bg-blue-500/20 text-blue-300 border-blue-500/40";
  if (kind === 1)
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (kind === 3)
    return "bg-violet-500/20 text-violet-300 border-violet-500/40";
  if (kind === 6)
    return "bg-amber-500/20 text-amber-200 border-amber-500/40";
  if (kind === 7)
    return "bg-pink-500/20 text-pink-300 border-pink-500/40";
  if (kind === 1059)
    return "bg-orange-500/20 text-orange-300 border-orange-500/40";
  if (kind === 10002)
    return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
  if (kind >= 20000 && kind <= 29999)
    return "bg-zinc-500/20 text-zinc-400 border-zinc-500/40";
  if (kind >= 30000 && kind <= 39999)
    return "bg-indigo-500/20 text-indigo-300 border-indigo-500/40";
  return "bg-zinc-600/30 text-zinc-400 border-zinc-500/30";
}

export function kindBadgeLabel(kind: number, t: DashboardT): string {
  if (kind === 0) return t("kindBadge.profile");
  if (kind === 1) return t("kindBadge.note");
  if (kind === 3) return t("kindBadge.contacts");
  if (kind === 6) return t("kindBadge.repost");
  if (kind === 7) return t("kindBadge.reaction");
  if (kind === 1059) return t("kindBadge.dm");
  if (kind === 10002) return t("kindBadge.relayList");
  if (kind >= 20000 && kind <= 29999) return t("kindBadge.ephemeral");
  if (kind >= 30000 && kind <= 39999) return t("kindBadge.addressable");
  return t("kindBadge.fallback", { kind });
}

export function kindBadgeMetaI18n(kind: number, t: DashboardT): {
  label: string;
  badgeClass: string;
} {
  return { label: kindBadgeLabel(kind, t), badgeClass: kindBadgeClass(kind) };
}

export function kindLongDescription(kind: number, t: DashboardT): string {
  if (kind === 0) return t("kindLong.k0");
  if (kind === 1) return t("kindLong.k1");
  if (kind === 3) return t("kindLong.k3");
  if (kind === 6) return t("kindLong.k6");
  if (kind === 7) return t("kindLong.k7");
  if (kind === 1059) return t("kindLong.k1059");
  if (kind === 10002) return t("kindLong.k10002");
  if (kind >= 20000 && kind <= 29999) return t("kindLong.ephemeral");
  if (kind >= 30000 && kind <= 39999) return t("kindLong.addressable");
  return t("kindLong.fallback", { kind });
}

export function kindDashboardRowTooltip(kind: number, t: DashboardT): string {
  if (kind === 0) return t("kindTooltip.k0");
  if (kind === 1) return t("kindTooltip.k1");
  if (kind === 3) return t("kindTooltip.k3");
  if (kind === 6) return t("kindTooltip.k6");
  if (kind === 7) return t("kindTooltip.k7");
  if (kind === 1059) return t("kindTooltip.k1059");
  if (kind === 10002) return t("kindTooltip.k10002");
  if (kind >= 20000 && kind <= 29999) return t("kindTooltip.ephemeral");
  if (kind >= 30000 && kind <= 39999) return t("kindTooltip.addressable");
  return t("kindTooltip.default");
}
