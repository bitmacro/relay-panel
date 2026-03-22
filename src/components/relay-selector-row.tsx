"use client";

import { useState, useRef, useEffect } from "react";
import { RELAY_COLOR_PRESETS } from "./relay-color-picker";

interface Relay {
  id: string;
  name: string | null;
  endpoint: string | null;
  color?: string | null;
}

function relayColor(relay: Relay): string {
  const c = relay.color?.trim();
  if (c && /^#[0-9a-fA-F]{6}$/.test(c)) return c;
  return RELAY_COLOR_PRESETS[0];
}

interface RelaySelectorRowProps {
  relays: Relay[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStartCreate?: () => void;
  providerUserId?: string | null;
}

export function RelaySelectorRow({
  relays,
  selectedId,
  onSelect,
  onStartCreate,
  providerUserId,
}: RelaySelectorRowProps) {
  const relayLabel = (r: Relay) => r.name ?? r.endpoint ?? r.id.slice(0, 8);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const selectedRelay = relays.find((r) => r.id === selectedId);

  return (
    <div className="border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Add relay */}
        {onStartCreate && (
          <button
            type="button"
            onClick={onStartCreate}
            className="rounded border border-[#5a3a0a] px-3 py-1.5 text-[12px] text-[#f7931a] hover:bg-[#1e1a0e]"
          >
            + Novo relay
          </button>
        )}

        {/* Right: Select relay with colored dot */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {relays.length === 0 ? (
            <p className="text-[11px] text-[#666]">
              Sem relays.
              {providerUserId && (
                <span className="ml-1">
                  Adicione em Supabase (provider_user_id=
                  {providerUserId?.slice(0, 8)}…)
                </span>
              )}
            </p>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 rounded border border-[#333] bg-[#141414] px-3 py-1.5 text-[12px] text-[#ccc] hover:border-[#444] focus:border-[#5a3a0a] focus:outline-none focus:ring-1 focus:ring-[#5a3a0a]"
              >
                {selectedRelay && (
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: relayColor(selectedRelay) }}
                  />
                )}
                <span>{selectedRelay ? relayLabel(selectedRelay) : "Selecionar"}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full z-10 mt-0.5 min-w-[180px] rounded border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
                  {relays.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        onSelect(r.id);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] text-[#ccc] hover:bg-[#252525]"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: relayColor(r) }}
                      />
                      {relayLabel(r)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
