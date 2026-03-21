"use client";

import { useState } from "react";

const KIND_STYLES: Record<number, string> = {
  0: "bg-[#2a1a4a] text-[#a78bfa]",
  1: "bg-[#0c2a4a] text-[#60a5fa]",
  3: "bg-[#0a2a1a] text-[#4ade80]",
  4: "bg-[#2a1a0a] text-[#fb923c]",
  6: "bg-[#2a0a0a] text-[#f87171]",
};

const MOCK_EVENTS = [
  { id: "1", kind: 1, pubkey: "npub1abc…f3d2", ago: "há 2 min", content: "Just stacked more sats on the dip..." },
  { id: "2", kind: 1, pubkey: "npub1xyz…9a1b", ago: "há 5 min", content: "BUY MEMECOIN NOW link in bio..." },
  { id: "3", kind: 0, pubkey: "npub1qrs…2c4e", ago: "há 12 min", content: '{"name":"alice","about":"Bitcoin...' },
  { id: "4", kind: 1, pubkey: "npub1def…7f8a", ago: "há 18 min", content: "Running a node for 2 years now..." },
  { id: "5", kind: 3, pubkey: "npub1mno…1e2f", ago: "há 31 min", content: '{"tags":[["p","3bf0c63f..."],["p...' },
];

export function EventsTab() {
  const [events, setEvents] = useState(MOCK_EVENTS);

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function handleBlock(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-medium text-[#ccc]">Eventos</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <select className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]">
            <option>Todos os kinds</option>
            <option>Kind 1</option>
            <option>Kind 0</option>
          </select>
          <select className="rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888]">
            <option>Últimas 24h</option>
            <option>Última semana</option>
            <option>Tudo</option>
          </select>
          <input
            type="text"
            placeholder="npub... ou id..."
            className="w-[130px] rounded-md border border-[#333] bg-[#1f1f1f] px-2 py-1 text-[11px] text-[#888] placeholder:text-[#555]"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <table className="w-full table-fixed border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="w-12 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Kind
              </th>
              <th className="w-[120px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Pubkey
              </th>
              <th className="w-20 border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Data
              </th>
              <th className="border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#555]">
                Conteúdo
              </th>
              <th className="w-[110px] border-b border-[#252525] bg-[#1f1f1f] px-2.5 py-1.5 text-[11px] font-medium text-[#555]"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-[#222] transition-colors last:border-b-0 hover:bg-[#1f1f1f]">
                <td className="overflow-hidden px-2.5 py-2 align-middle text-ellipsis whitespace-nowrap">
                  <span
                    className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      KIND_STYLES[e.kind] ?? "bg-[#252525] text-[#888]"
                    }`}
                  >
                    {e.kind}
                  </span>
                </td>
                <td className="overflow-hidden px-2.5 py-2 font-mono text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
                  {e.pubkey}
                </td>
                <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#555] text-ellipsis whitespace-nowrap">
                  {e.ago}
                </td>
                <td className="overflow-hidden px-2.5 py-2 text-[11px] text-[#666] text-ellipsis whitespace-nowrap">
                  {e.content}
                </td>
                <td className="px-2.5 py-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(e.id)}
                    className="rounded border border-[#5a1a1a] px-2 py-0.5 text-[10px] text-[#f87171] transition-colors hover:bg-[#2a0a0a]"
                  >
                    Deletar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBlock(e.id)}
                    className="ml-1 rounded border border-[#333] px-2 py-0.5 text-[10px] text-[#888] transition-colors hover:bg-[#252525]"
                  >
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && (
        <p className="py-8 text-center text-[12px] text-[#666]">
          Nenhum evento. Ajuste os filtros ou aguarde novos eventos.
        </p>
      )}
    </div>
  );
}
