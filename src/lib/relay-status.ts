"use client";

import { useSyncExternalStore } from "react";

/** One status for a relay, shared by the table, the detail header and the sidebar. */
export type RelayStatus = "online" | "unhealthy" | "offline" | "loading" | "noAgent";

/**
 * - noAgent:   catalogue-only relay (no endpoint) or the API says no_agent
 * - offline:   the agent did not answer with 2xx (down, 401, 503, network)
 * - unhealthy: the agent answered 2xx but strfry is not "ok"
 * - online:    the agent answered and strfry is "ok"
 */
export function deriveRelayStatus(input: {
  agentManaged: boolean;
  noAgent?: boolean;
  httpOk: boolean;
  health?: { status?: string } | null;
}): Exclude<RelayStatus, "loading"> {
  if (!input.agentManaged || input.noAgent) return "noAgent";
  if (!input.httpOk) return "offline";
  return input.health?.status === "ok" ? "online" : "unhealthy";
}

const statuses = new Map<string, RelayStatus>();
const listeners = new Set<() => void>();
let snapshot: Record<string, RelayStatus> = {};
const EMPTY: Record<string, RelayStatus> = {};

export function setRelayStatus(id: string, status: RelayStatus): void {
  if (statuses.get(id) === status) return;
  statuses.set(id, status);
  snapshot = Object.fromEntries(statuses);
  listeners.forEach((l) => l());
}

export function hasRelayStatus(id: string): boolean {
  return statuses.has(id);
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useRelayStatuses(): Record<string, RelayStatus> {
  return useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
}
