# BitMacro Relay Manager — relay-panel

[![CI](https://github.com/bitmacro/relay-panel/actions/workflows/ci.yml/badge.svg)](https://github.com/bitmacro/relay-panel/actions/workflows/ci.yml)
[![version](https://img.shields.io/badge/version-0.2.1-blue)](https://github.com/bitmacro/relay-panel/releases)
[![License](https://img.shields.io/badge/license-BSL_1.1-orange)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

**Manage your Nostr relay without touching the terminal.**

Web UI for the [BitMacro Relay Manager](https://bitmacro.io) ecosystem. Visual dashboard for relay operators — moderation, access control, Lightning payments and multi-relay management in one panel.

🔗 **[relay-panel.bitmacro.io](https://relay-panel.bitmacro.io)** — landing + sign in with GitHub

---

## Screenshot

![BitMacro Relay Manager — Dashboard](public/panel.png)

*Relay Hosts table with status badges, sidebar navigation, and relay management.*

---

## What it does

| Feature | Description |
|---------|-------------|
| **Visual Dashboard** | Events, DB size, uptime, activity by kind |
| **Access Control** | Whitelist/blocklist with toggle, no SSH needed |
| **Lightning Payments** | Automatic access after payment, LNbits webhook |
| **Multi-relay** | Manage N relays from one agent instance |
| **GitHub Auth** | NextAuth.js v5, no passwords |

---

## Routing

| Path | Description |
|------|-------------|
| `/` | Landing page (public) |
| `/auth/signin` | Sign in with GitHub |
| `/relays` | Dashboard — relay table (protected) |
| `/relays/[id]` | Relay detail — Dashboard, Eventos, Acesso, Config (protected) |

---

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4 + shadcn/ui
- NextAuth.js v5 (GitHub)

---

## Setup

```bash
cp .env.example .env.local
# Edit .env.local with required values

npm install
npm run dev
```

### Required environment variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secret for JWT signing (min 32 chars, e.g. `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | relay-api base URL (e.g. `https://relay-api.bitmacro.io`) |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `RELAY_API_KEY` | API key shared with relay-api |

---

## Architecture

The panel **never** talks directly to relay-agents or Supabase. All logic goes through relay-api:

```
relay-panel (this repo)
    │  /api/* → proxy with X-API-Key + X-Provider-User-Id
    ▼
relay-api (Vercel, Supabase)
    │  REST + Bearer JWT
    ▼
relay-agent (runs on your server)
    │  strfry CLI / LMDB
    ▼
Nostr relay (strfry)
```

---

## Ecosystem

| Project | Description | License |
|---------|-------------|---------|
| [relay-agent](https://github.com/bitmacro/relay-agent) | REST API agent for strfry | MIT |
| [relay-api](https://github.com/bitmacro/relay-api) | Central hub (Supabase, proxy) | Private |
| **relay-panel** | This repo — frontend | BSL 1.1 |

---

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bitmacro/relay-panel)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and PR guidelines.

---

## License

Business Source License 1.1 (BSL-1.1). See [LICENSE](LICENSE).
