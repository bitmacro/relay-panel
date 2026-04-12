"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { NostrEventRow } from "@/lib/events-display";
import { kindBadgeMetaI18n } from "@/lib/dashboard-kind-i18n";
import {
  pubkeyAvatarClasses,
  displayInitials,
  firstTagValue,
  truncateEventId,
  parseKind0Profile,
  extractNoteImageUrl,
  feedOtherContentPreview,
  truncateAbout,
} from "@/lib/events-display";

function FeedAuthorAvatar({
  pubkey,
  picture,
  profileDisplayNameForInitials,
  sizeClass,
  textSizeClass,
}: {
  pubkey: string;
  picture?: string | null;
  profileDisplayNameForInitials: string | null;
  sizeClass: string;
  textSizeClass: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = picture?.trim() ?? "";
  const showImage = Boolean(url && !imgFailed);

  if (showImage) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ${sizeClass}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${pubkeyAvatarClasses(pubkey)} ${sizeClass} ${textSizeClass}`}
    >
      {displayInitials(profileDisplayNameForInitials, pubkey)}
    </div>
  );
}

interface EventFeedCardProps {
  event: NostrEventRow;
  authorLabel: string;
  authorHasProfileName: boolean;
  profileDisplayNameForInitials: string | null;
  /** From kind 0 metadata (event or profile cache), like Access tab */
  authorPicture?: string | null;
  formatAgo: (ts: number) => string;
  resolvePubkeyLabel: (hex: string) => string;
  onOpenDetail: () => void;
  onDelete: () => void;
  onBlock: () => void;
}

export function EventFeedCard({
  event: e,
  authorLabel,
  authorHasProfileName,
  profileDisplayNameForInitials,
  authorPicture = null,
  formatAgo,
  resolvePubkeyLabel,
  onOpenDetail,
  onDelete,
  onBlock,
}: EventFeedCardProps) {
  const t = useTranslations("EventsTab");
  const td = useTranslations("dashboard");
  const meta = kindBadgeMetaI18n(e.kind, td);

  function renderBody() {
    if (e.kind === 0) {
      const { name, about, picture } = parseKind0Profile(e.content);
      const displayName = name || authorLabel;
      const aboutText = truncateAbout(about, 120);
      return (
        <div className="flex gap-3 items-start">
          <FeedAuthorAvatar
            pubkey={e.pubkey}
            picture={picture ?? authorPicture}
            profileDisplayNameForInitials={name || null}
            sizeClass="h-14 w-14"
            textSizeClass="text-lg"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[15px] font-semibold text-foreground">
              {displayName}
            </div>
            {aboutText ? (
              <p className="text-[13px] text-muted-foreground leading-snug whitespace-pre-wrap break-words">
                {aboutText}
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground/70 italic">
                {t("feed.noDescription")}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (e.kind === 1) {
      const img = extractNoteImageUrl(e.content);
      return (
        <div className="space-y-3">
          <p className="text-[13px] text-foreground whitespace-pre-wrap break-words">
            {e.content || "—"}
          </p>
          {img && (
            <a href={img} target="_blank" rel="noopener noreferrer" className="block" onClick={(ev) => ev.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="max-h-[300px] w-auto max-w-full rounded-md border border-border object-contain"
              />
            </a>
          )}
        </div>
      );
    }

    if (e.kind === 6) {
      const eid = firstTagValue(e.tags, "e");
      const refPk = firstTagValue(e.tags, "p");
      const innerText =
        (e.content?.trim() && e.content.slice(0, 160)) ||
        (eid ? t("feed.repostEvent", { id: truncateEventId(eid) }) : t("feed.repost"));
      return (
        <div className="space-y-2">
          <p className="text-[12px] text-muted-foreground">{t("feed.reposted")}</p>
          <div className="rounded-lg border border-border/80 bg-secondary/30 px-3 py-2.5">
            <p className="text-[13px] text-foreground/90 line-clamp-4 whitespace-pre-wrap break-words">
              {innerText}
            </p>
            {eid && (
              <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                id: {truncateEventId(eid)}
              </p>
            )}
            {refPk && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {t("feed.author")}:{" "}
                <span className="font-mono">{resolvePubkeyLabel(refPk)}</span>
              </p>
            )}
          </div>
        </div>
      );
    }

    if (e.kind === 7) {
      const eid = firstTagValue(e.tags, "e");
      return (
        <div className="space-y-2">
          <div className="text-4xl leading-none" aria-hidden>
            {e.content?.trim() || "·"}
          </div>
          {eid && (
            <p className="text-[12px] text-muted-foreground">
              {t("feed.inResponseTo")}{" "}
              <span className="font-mono text-foreground/80">
                {truncateEventId(eid)}
              </span>
            </p>
          )}
        </div>
      );
    }

    if (e.kind === 1059) {
      return (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="text-lg" aria-hidden>🔒</span>
          {t("feed.encrypted")}
        </div>
      );
    }

    if (e.kind === 10002) {
      const n = (e.tags ?? []).filter((t) => t[0] === "r").length;
      return (
        <p className="text-[13px] text-foreground">
          {t("feed.relayListUpdate", { count: n })}
        </p>
      );
    }

    return (
      <p className="text-[13px] text-muted-foreground whitespace-pre-wrap break-words">
        {feedOtherContentPreview(e)}
      </p>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onOpenDetail();
        }
      }}
      className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] overflow-hidden transition-colors hover:border-[#3a3a3a] cursor-pointer text-left"
    >
      <div className="flex items-start gap-3 px-4 pt-3 pb-2 border-b border-[#252525]/80">
        <FeedAuthorAvatar
          pubkey={e.pubkey}
          picture={authorPicture}
          profileDisplayNameForInitials={
            authorHasProfileName ? profileDisplayNameForInitials : null
          }
          sizeClass="h-9 w-9"
          textSizeClass="text-[11px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13px] font-medium text-foreground truncate max-w-[200px]">
              {authorLabel}
            </span>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {formatAgo(e.created_at)}
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${meta.badgeClass}`}
            >
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">{renderBody()}</div>

      <div
        className="flex items-center gap-2 border-t border-[#252525]/80 px-4 py-2.5 bg-[#141414]/80"
        onClick={(ev) => ev.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDelete}
          className="h-8 rounded-md border border-border/50 bg-transparent px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:bg-secondary/60"
          title={t("feed.btnHideHint")}
        >
          {t("feed.btnHide")}
        </button>
        <button
          type="button"
          onClick={onBlock}
          className="h-8 rounded-md border border-amber-500/35 bg-amber-500/10 px-2.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/15 dark:text-amber-300"
          title={t("feed.btnSpamHint")}
        >
          {t("feed.btnSpam")}
        </button>
      </div>
    </article>
  );
}