/**
 * Logging servidor (API routes, RSC) com push Loki opcional — sem Supabase no painel.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogContext {
  path?: string;
  method?: string;
  event?: string;
  journey_id?: string;
  request_id?: string;
  service?: string;
  skipUserLookup?: boolean;
  [key: string]: unknown;
}

const isClient = typeof window !== "undefined";
const isProduction = process.env.NODE_ENV === "production";

const PII_KEYS = [
  "userId",
  "userEmail",
  "user",
  "email",
  "password",
  "token",
  "secret",
  "client_secret",
  "authorization",
  "cookie",
  "cookies",
  "nsec",
  "pkce",
  "code_verifier",
  "challengeToken",
  "refresh_token",
  "access_token",
];

function sanitizeForLoki(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (PII_KEYS.includes(k) || lower.includes("email") || lower.includes("password")) continue;
    if (
      lower.includes("secret") ||
      lower.includes("token") ||
      lower.includes("authorization") ||
      lower.includes("cookie") ||
      lower.includes("pkce") ||
      lower.includes("nsec")
    ) {
      continue;
    }
    out[k] = v;
  }
  return out;
}

async function createLog(
  level: LogLevel,
  component: string,
  message: string,
  context: LogContext = {}
): Promise<void> {
  const timestamp = new Date().toISOString();
  const defaultService =
    (process.env.BITMACRO_LOG_SERVICE as string | undefined) || "relay-panel";

  const logData: Record<string, unknown> = {
    timestamp,
    level,
    component: `[${component}]`,
    message,
    ...context,
  };

  Object.keys(logData).forEach((key) => {
    if (logData[key] === undefined) delete logData[key];
  });

  if (isClient) {
    if (isProduction && level === "error") {
      /* Sem /api/log no painel — não enviar PII ao browser */
    }
    return;
  }

  const isEdge = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";
  if (!isEdge) {
    const lokiOn =
      Boolean(process.env.LOKI_HOST) &&
      Boolean(process.env.LOKI_USER) &&
      Boolean(process.env.LOKI_PASSWORD);
    if (lokiOn) {
      try {
        const { pushLokiStructured } = await import("@/lib/observability/loki-http-push");
        const { timestamp: _t, level: _lv, message: _m, component: _comp, ...rest } =
          logData as Record<string, unknown>;
        const extra = sanitizeForLoki(rest);
        await pushLokiStructured(level, {
          service: (context.service as string) || defaultService,
          component,
          event: (context.event as string) || `panel.log.${level}`,
          journey_id: (context.journey_id as string) || "none",
          request_id: (context.request_id as string) || "none",
          message,
          ...extra,
        });
        if (isProduction) return;
      } catch {
        /* console fallback */
      }
    }
  }

  const errorDetail = logData.error ? ` | ${String(logData.error)}` : "";
  const logMessage = `${logData.component} ${message}${errorDetail}`;

  try {
    switch (level) {
      case "error":
        console.error(`❌ ${logMessage}`, logData);
        break;
      case "warn":
        console.warn(`⚠️ ${logData.component} ${message}`, logData);
        break;
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(`🔍 ${logData.component} ${message}`, logData);
        }
        break;
      default:
        console.log(`✅ ${logMessage}`, logData);
    }
  } catch {
    console.error(`❌ ${logData.component} ${message}`);
  }
}

export const serverLogger = {
  info: async (component: string, message: string, context: LogContext = {}) => {
    await createLog("info", component, message, { ...context, skipUserLookup: true });
  },

  warn: async (component: string, message: string, context: LogContext = {}) => {
    await createLog("warn", component, message, { ...context, skipUserLookup: true });
  },

  error: async (
    component: string,
    message: string,
    error?: Error | unknown,
    context: LogContext = {}
  ) => {
    const errorContext: LogContext = { ...context, skipUserLookup: true };
    if (error instanceof Error) {
      errorContext.error = error.message;
      errorContext.stack = error.stack;
    } else if (error) {
      errorContext.error = String(error);
    }
    await createLog("error", component, message, errorContext);
  },

  debug: async (component: string, message: string, context: LogContext = {}) => {
    if (process.env.NODE_ENV === "development") {
      await createLog("debug", component, message, { ...context, skipUserLookup: true });
    }
  },
};
