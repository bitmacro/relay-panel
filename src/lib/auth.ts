import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import {
  githubOAuthConfigured,
  githubOAuthCredentials,
  syncAuthJsEnvFromLegacy,
} from "@/lib/auth-github";
import { publicAuthErrorFields } from "@/lib/auth-public-error";
import { getAuthSecret } from "@/lib/auth-secret";
import { authorizeNostrNip07 } from "@/lib/nostr-nip07-authorize";
import { serverLogger } from "@/utils/logger";

syncAuthJsEnvFromLegacy();

const github = githubOAuthCredentials();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  logger: {
    error(error) {
      const fields = publicAuthErrorFields(error);
      void serverLogger.error("AUTH", `Auth.js ${fields.name}`, undefined, {
        event: "authjs.error",
        auth_error: fields.name,
        cause_name: fields.cause_name,
        auth_message: fields.message,
        github_oauth_configured: githubOAuthConfigured(),
      });
    },
    warn(code) {
      void serverLogger.warn("AUTH", String(code), { event: "authjs.warn" });
    },
  },
  events: {
    async signIn({ account }) {
      await serverLogger.info("AUTH", "sign-in ok", {
        event: "auth.signin.ok",
        provider: account?.provider ?? "unknown",
      });
    },
  },
  providers: [
    GitHub({
      clientId: github?.clientId,
      clientSecret: github?.clientSecret,
      // GitHub RFC 9207 (Apr 2026): callback includes iss=https://github.com/login/oauth.
      // Auth.js beta.25 has no issuer → oauth4webapi compares against authjs.dev → CallbackRouteError.
      issuer: "https://github.com/login/oauth",
      checks: ["state"],
      client: { token_endpoint_auth_method: "client_secret_post" },
    }),
    Credentials({
      id: "nostr",
      name: "Nostr",
      credentials: {
        challengeToken: { label: "Challenge token", type: "text" },
        eventJson: { label: "Signed event", type: "text" },
        pubkey: { label: "Pubkey hex", type: "text" },
      },
      authorize: (credentials) => authorizeNostrNip07(credentials),
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      const base = baseUrl.replace(/\/$/, "");
      const isRootPath = (pathname: string) =>
        pathname === "/" || pathname === "";

      if (url.startsWith("/")) {
        if (isRootPath(url)) return `${base}/relays`;
        return `${base}${url}`;
      }

      try {
        const next = new URL(url);
        const home = new URL(base + "/");
        if (next.origin !== home.origin) return `${base}/relays`;
        if (isRootPath(next.pathname)) return `${base}/relays`;
        return url;
      } catch {
        return `${base}/relays`;
      }
    },
    jwt({ token, account, profile, user }) {
      if (account?.type === "credentials" && user?.id) {
        token.providerUserId = user.id;
        if (typeof user.name === "string") token.name = user.name;
        delete token.githubLogin;
      } else if (account?.provider === "github") {
        if (account.providerAccountId) {
          token.providerUserId = String(account.providerAccountId);
        }
        if (profile && typeof profile === "object" && "login" in profile) {
          const login = (profile as { login?: string }).login;
          if (typeof login === "string") token.githubLogin = login;
        }
        if (profile && typeof profile === "object" && "name" in profile) {
          const n = (profile as { name?: string }).name;
          if (typeof n === "string") token.name = n;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id =
          (token.providerUserId as string) ?? token.sub ?? undefined;
        const gl = token.githubLogin;
        if (typeof gl === "string") {
          (session.user as { githubLogin?: string }).githubLogin = gl;
        } else {
          delete (session.user as { githubLogin?: string }).githubLogin;
        }
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
  },
});
