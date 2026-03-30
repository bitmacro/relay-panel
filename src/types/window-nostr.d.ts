/** NIP-07 browser extension (Alby, nos2x, etc.) */
interface WindowNostr {
  getPublicKey?: () => Promise<string>;
  signEvent?: (event: unknown) => Promise<unknown>;
}

interface Window {
  nostr?: WindowNostr;
}
