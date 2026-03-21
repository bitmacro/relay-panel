# @bitmacro/relay-panel

[![CI](https://github.com/bitmacro/relay-panel/actions/workflows/ci.yml/badge.svg)](https://github.com/bitmacro/relay-panel/actions/workflows/ci.yml)
[![version](https://img.shields.io/badge/version-0.1.0-blue)](https://github.com/bitmacro/relay-panel/releases)
[![License](https://img.shields.io/badge/license-BSL_1.1-orange)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bitmacro/relay-panel)

**Manage Nostr relays from the browser.**

Next.js frontend for the [BitMacro Relay Manager](https://bitmacro.io) ecosystem. This panel **consumes only the relay-api** — it never talks directly to relay-agents or Supabase.

---

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4 + shadcn/ui
- NextAuth.js v5

---

## Setup

```bash
cp .env.example .env.local
# Edit .env.local: NEXTAUTH_SECRET, NEXT_PUBLIC_API_URL

npm install
npm run dev
```

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Secret for JWT signing (min 32 chars) |
| `NEXT_PUBLIC_API_URL` | relay-api base URL (e.g. `https://relay-api.bitmacro.cloud`) |

---

## Architecture

```
relay-panel (this repo)
    │  HTTP + JWT
    ▼
relay-api (Vercel)
    │  HTTP REST + Bearer JWT
    ▼
relay-agent
    │  child_process spawn()
    ▼
strfry (local C++ process / LMDB)
```

---

## Ecosystem

| Project | Description | License |
|---------|-------------|---------|
| [relay-agent](https://github.com/bitmacro/relay-agent) | REST API agent for strfry | MIT |
| [relay-api](https://github.com/bitmacro/relay-api) | Central hub (Supabase, proxy) | Private |
| **relay-panel** | This repo — frontend | BSL 1.1 |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and PR guidelines.

---

## License

Business Source License 1.1 (BSL-1.1). See [LICENSE](LICENSE).
