type Status = "online" | "unhealthy" | "offline" | "loading";

interface RelayStatusBadgeProps {
  status: Status;
}

export function RelayStatusBadge({ status }: RelayStatusBadgeProps) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
        <span className="w-[5px] h-[5px] rounded-full bg-current" />
        —
      </span>
    );
  }
  if (status === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-[#22c55e1a] text-[#22c55e]">
        <span className="w-[5px] h-[5px] rounded-full bg-current" />
        Online
      </span>
    );
  }
  if (status === "unhealthy") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-[#eab3081a] text-[#eab308]">
        <span className="w-[5px] h-[5px] rounded-full bg-current" />
        Unhealthy
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-[#ef44441a] text-[#ef4444]">
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      Offline
    </span>
  );
}
