"use client";

import { RELAY_CONNECT_PRODUCT_NAME } from "@bitmacro/relay-connect";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, startTransition } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { watchNip46Bridge } from "@/lib/nip46-bridge";
import { getOrCreateAppKeypair, parsePairingSecretFromNostrConnectUri } from "@/lib/nostr-app-keys";
import { resolveBridgeWss } from "@/lib/relay-bridge-wss";
import { signerFetch } from "@/lib/signer-fetch";

const POLL_MS = 2000;
const TIMEOUT_MS = 5 * 60 * 1000;

type RelayRow = {
  id: string;
  name: string | null;
  endpoint: string;
  agent_relay_id: string | null;
};

type Phase = "idle" | "loading" | "qr" | "waiting" | "failure";

type Strings = {
  title: string;
  waitHint: string;
  waiting: string;
  copyUri: string;
  manualFinish: string;
  finishing: string;
  retry: string;
  configError: string;
  noRelays: string;
  bridgeError: string;
  connectFailed: string;
  remotePubkeyMissing: string;
  genericError: string;
  timeout: string;
  revoked: string;
};

interface NostrConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked: (hexPubkeyLower: string) => void;
  labels: Strings;
}

export function NostrConnectDialog({
  open,
  onOpenChange,
  onLinked,
  labels,
}: NostrConnectDialogProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [nostrconnectUri, setNostrconnectUri] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState("");

  const sessionIdRef = useRef<string | null>(null);
  const pairingSecretRef = useRef<string | null>(null);
  const remotePubkeyRef = useRef<string | null>(null);
  const completeSentRef = useRef(false);
  const unsubBridgeRef = useRef<(() => void) | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollLoggedActiveRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (unsubBridgeRef.current) {
      unsubBridgeRef.current();
      unsubBridgeRef.current = null;
    }
  }, []);

  const resetFlow = useCallback(() => {
    clearTimers();
    completeSentRef.current = false;
    pollLoggedActiveRef.current = false;
    sessionIdRef.current = null;
    pairingSecretRef.current = null;
    remotePubkeyRef.current = null;
    setNostrconnectUri(null);
    setErrorDetail(null);
    setStatusLine("");
    setPhase("idle");
  }, [clearTimers]);

  const callComplete = useCallback(async (): Promise<boolean> => {
    const sid = sessionIdRef.current;
    const secret = pairingSecretRef.current;
    if (!sid || !secret || completeSentRef.current) return false;
    completeSentRef.current = true;
    const res = await signerFetch(`/session/${sid}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairing_secret: secret }),
    });
    if (!res.ok) {
      completeSentRef.current = false;
      const j = await res.json().catch(() => ({}));
      const detail = typeof j?.detail === "string" ? j.detail : res.statusText;
      setErrorDetail(detail || `HTTP ${res.status}`);
      setPhase("failure");
      return false;
    }
    return true;
  }, []);

  const pollSessions = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    const res = await signerFetch(`/sessions`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      sessions?: Array<{ id: string; status: string }>;
    };
    const row = data.sessions?.find((s) => s.id === sid);
    if (!row) return;

    if (row.status === "active") {
      if (!pollLoggedActiveRef.current) {
        pollLoggedActiveRef.current = true;
      }
      const remote = remotePubkeyRef.current;
      if (!remote || !/^[0-9a-f]{64}$/i.test(remote)) {
        clearTimers();
        setErrorDetail(labels.remotePubkeyMissing);
        setPhase("failure");
        return;
      }
      clearTimers();
      onLinked(remote.toLowerCase());
      resetFlow();
      onOpenChange(false);
      return;
    }
    if (row.status === "revoked") {
      clearTimers();
      setErrorDetail(labels.revoked);
      setPhase("failure");
    }
  }, [clearTimers, labels.remotePubkeyMissing, labels.revoked, onLinked, onOpenChange, resetFlow]);

  const startWaitingLoop = useCallback(
    (bridgeWss: string, appPubkeyHex: string) => {
      completeSentRef.current = false;

      unsubBridgeRef.current = watchNip46Bridge({
        bridgeWss,
        appPubkeyHex,
        onRemoteSignerPubkey: (pk) => {
          if (!remotePubkeyRef.current) {
            remotePubkeyRef.current = pk;
          }
          void (async () => {
            const ok = await callComplete();
            if (ok) await pollSessions();
          })();
        },
      });

      pollRef.current = setInterval(() => {
        void pollSessions();
      }, POLL_MS);

      timeoutRef.current = setTimeout(() => {
        clearTimers();
        setErrorDetail(labels.timeout);
        setPhase("failure");
      }, TIMEOUT_MS);
    },
    [callComplete, clearTimers, labels.timeout, pollSessions]
  );

  const runConnect = useCallback(async () => {
    setErrorDetail(null);
    setPhase("loading");
    setNostrconnectUri(null);

    try {
      const { appPubkeyHex } = getOrCreateAppKeypair();
      const cfgRes = await signerFetch("/config");
      if (!cfgRes.ok) {
        const j = await cfgRes.json().catch(() => ({}));
        setErrorDetail(
          typeof j?.error === "string" ? j.error : labels.configError
        );
        setPhase("failure");
        return;
      }

      const cfg = (await cfgRes.json()) as { relays?: RelayRow[] };
      const relays = cfg.relays ?? [];
      const envRelayId = process.env.NEXT_PUBLIC_RELAY_CONFIG_ID?.trim();
      const relay = envRelayId
        ? relays.find((r) => r.id === envRelayId) ?? relays[0]
        : relays.find((r) => r.agent_relay_id === "public") ?? relays[0];

      if (!relay) {
        setErrorDetail(labels.noRelays);
        setPhase("failure");
        return;
      }

      const bridgeWss = resolveBridgeWss(relay) || "";
      if (!bridgeWss || !/^wss:\/\//i.test(bridgeWss)) {
        setErrorDetail(labels.bridgeError);
        setPhase("failure");
        return;
      }

      const connectRes = await signerFetch("/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relay_config_id: relay.id,
          app_pubkey: appPubkeyHex,
          client_name: `Relay Panel · ${RELAY_CONNECT_PRODUCT_NAME}`,
          bridge_wss: bridgeWss,
        }),
      });

      const connectJson = (await connectRes.json()) as {
        session_id?: string;
        nostrconnect_uri?: string;
        error?: string;
        detail?: string;
      };

      if (!connectRes.ok || !connectJson.session_id || !connectJson.nostrconnect_uri) {
        setErrorDetail(
          connectJson.detail || connectJson.error || labels.connectFailed
        );
        setPhase("failure");
        return;
      }

      const secret = parsePairingSecretFromNostrConnectUri(
        connectJson.nostrconnect_uri
      );
      if (!secret) {
        setErrorDetail(labels.connectFailed);
        setPhase("failure");
        return;
      }

      sessionIdRef.current = connectJson.session_id;
      pairingSecretRef.current = secret;
      remotePubkeyRef.current = null;
      pollLoggedActiveRef.current = false;
      setNostrconnectUri(connectJson.nostrconnect_uri);
      setPhase("qr");

      window.setTimeout(() => {
        setPhase("waiting");
        startWaitingLoop(bridgeWss, appPubkeyHex);
      }, 400);
    } catch (e) {
      setErrorDetail(e instanceof Error ? e.message : labels.genericError);
      setPhase("failure");
    }
  }, [labels, startWaitingLoop]);

  const runConnectRef = useRef(runConnect);
  useEffect(() => {
    runConnectRef.current = runConnect;
  }, [runConnect]);

  useEffect(() => {
    if (!open) {
      clearTimers();
      startTransition(() => {
        setPhase("idle");
        setNostrconnectUri(null);
        setErrorDetail(null);
        setStatusLine("");
      });
      sessionIdRef.current = null;
      pairingSecretRef.current = null;
      remotePubkeyRef.current = null;
      completeSentRef.current = false;
      pollLoggedActiveRef.current = false;
      return;
    }
    void runConnectRef.current();
    return () => clearTimers();
  }, [open, clearTimers]);

  const copyUri = async () => {
    if (!nostrconnectUri) return;
    try {
      await navigator.clipboard.writeText(nostrconnectUri);
    } catch {
      /* ignore */
    }
  };

  const manualFinish = async () => {
    setStatusLine(labels.finishing);
    const ok = await callComplete();
    if (ok) await pollSessions();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetFlow();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[320px] sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{labels.title}</DialogTitle>
        </DialogHeader>

        {phase === "loading" && (
          <div className="flex justify-center py-10 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
          </div>
        )}

        {(phase === "qr" || phase === "waiting") && nostrconnectUri && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl bg-white p-3 ring-1 ring-border">
              <QRCodeSVG value={nostrconnectUri} size={220} level="M" />
            </div>
            <p className="text-center text-[12px] text-muted-foreground leading-relaxed px-1">
              {labels.waitHint}
            </p>
            <button
              type="button"
              onClick={() => void copyUri()}
              className="text-[12px] text-[#f7931a] hover:underline"
            >
              {labels.copyUri}
            </button>
            {phase === "waiting" && (
              <div className="flex w-full flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span className="text-[12px]">{labels.waiting}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void manualFinish()}
                  className="text-[11px] text-muted-foreground underline decoration-muted-foreground/50 underline-offset-4"
                >
                  {labels.manualFinish}
                </button>
                {statusLine ? (
                  <p className="text-[11px] text-muted-foreground">{statusLine}</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {phase === "failure" && (
          <div className="space-y-4 py-2">
            {errorDetail ? (
              <p className="text-[11px] text-destructive break-words font-mono leading-relaxed">
                {errorDetail}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void runConnect()}
              className="w-full py-2 rounded-md bg-secondary text-[13px] font-medium border border-border hover:bg-muted transition-colors"
            >
              {labels.retry}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}