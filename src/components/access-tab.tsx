"use client";

import { useState } from "react";

const MOCK_ENTRIES = [
  { id: "1", name: "thiago.bitmacro", npub: "npub1thg…4a2b3c", allowed: true },
  { id: "2", name: "alice", npub: "npub1ali…9f8e7d", allowed: true },
  { id: "3", name: "spammer_1", npub: "npub1xyz…2c1b0a", allowed: false },
  { id: "4", name: "bob_dev", npub: "npub1bob…5d6e7f", allowed: true },
];

export function AccessTab() {
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [addValue, setAddValue] = useState("");

  function toggleAccess(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, allowed: !e.allowed } : e))
    );
  }

  function handleAdd() {
    if (!addValue.trim()) return;
    setEntries((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: addValue.slice(0, 12),
        npub: addValue.startsWith("npub") ? `${addValue.slice(0, 10)}…` : addValue.slice(0, 10) + "…",
        allowed: true,
      },
    ]);
    setAddValue("");
  }

  return (
    <div className="space-y-0">
      <div className="mb-3 text-[13px] font-medium text-[#ccc]">
        Controlo de acesso
      </div>
      <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex items-center gap-2.5 border-b border-[#222] bg-[#1f1f1f] px-3 py-2 text-[11px] font-medium text-[#555]">
          <span className="min-w-[120px]">Nome</span>
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
            Pubkey
          </span>
          <span className="min-w-[80px]">Estado</span>
          <span className="min-w-[50px] text-center">Acesso</span>
        </div>
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-2.5 border-b border-[#222] px-3 py-2.5 text-[12px] last:border-b-0"
          >
            <span className="min-w-[120px] text-[#ccc]">{e.name}</span>
            <span className="flex-1 overflow-hidden font-mono text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
              {e.npub}
            </span>
            <span
              className={`min-w-[80px] rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                e.allowed ? "bg-[#0a2a1a] text-[#4ade80]" : "bg-[#2a0a0a] text-[#f87171]"
              }`}
            >
              {e.allowed ? "permitido" : "bloqueado"}
            </span>
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => toggleAccess(e.id)}
                className={`relative h-4 w-7 shrink-0 cursor-pointer rounded-full border transition-colors ${
                  e.allowed
                    ? "border-[#f7931a] bg-[#f7931a]"
                    : "border-[#333] bg-[#252525]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-[left] ${
                    e.allowed ? "left-3.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
        <div className="flex gap-2 border-t border-[#222] px-3 py-2.5">
          <input
            type="text"
            value={addValue}
            onChange={(ev) => setAddValue(ev.target.value)}
            onKeyDown={(ev) => ev.key === "Enter" && handleAdd()}
            placeholder="npub1... ou hex pubkey"
            className="flex-1 rounded-md border border-[#333] bg-[#141414] px-2.5 py-1.5 text-[12px] text-[#ccc] placeholder:text-[#555]"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="shrink-0 rounded-md border border-[#5a3a0a] px-3 py-1.5 text-[12px] text-[#f7931a] transition-colors hover:bg-[#1e1a0e]"
          >
            + Adicionar pubkey
          </button>
        </div>
      </div>
    </div>
  );
}
