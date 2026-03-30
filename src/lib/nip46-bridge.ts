import { SimplePool } from "nostr-tools/pool";

const KIND_NIP46 = 24133;

/**
 * Subscribe to NIP-46 bridge traffic; first remote kind 24133 yields the signer's pubkey (`ev.pubkey`).
 */
export function watchNip46Bridge(params: {
  bridgeWss: string;
  appPubkeyHex: string;
  onRemoteSignerPubkey: (pubkeyHex: string) => void;
}): () => void {
  const pool = new SimplePool({ enablePing: true });
  const sub = pool.subscribeMany(
    [params.bridgeWss],
    {
      kinds: [KIND_NIP46],
      "#p": [params.appPubkeyHex],
    },
    {
      onevent: (ev) => {
        if (ev.pubkey === params.appPubkeyHex) return;
        params.onRemoteSignerPubkey(ev.pubkey);
      },
    }
  );

  return () => {
    try {
      sub.close();
    } catch {
      /* ignore */
    }
    try {
      pool.close([params.bridgeWss]);
    } catch {
      /* ignore */
    }
  };
}
