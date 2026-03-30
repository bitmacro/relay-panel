/** Client fetch to Next.js `/api/signer` (relay-api auth on the server only). */
export function signerFetch(path: string, init?: RequestInit): Promise<Response> {
  const method = init?.method ?? "GET";
  const dev = typeof window !== "undefined" && process.env.NODE_ENV === "development";

  if (dev) {
    console.log("[relay-panel][signer]", method, `/api/signer${path}`);
  }

  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();

  return (async () => {
    try {
      const res = await fetch(`/api/signer${path}`, init);
      const ms =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
      if (dev) {
        console.log("[relay-panel][signer]", method, `/api/signer${path}`, {
          status: res.status,
          ok: res.ok,
          ms: Math.round(ms),
        });
      }
      return res;
    } catch (e) {
      const ms =
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
      if (dev) {
        console.error("[relay-panel][signer]", method, `/api/signer${path}`, {
          ms: Math.round(ms),
          err: e instanceof Error ? e.message : e,
        });
      }
      throw e;
    }
  })();
}
