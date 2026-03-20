# relay-panel

**Manage Nostr relays from the browser.**

Next.js frontend for the [BitMacro Relay Manager](https://bitmacro.io) ecosystem. This panel **consumes only the relay-api** — it never talks directly to relay-agents or Supabase.

---

## Stack

- Next.js 14 (App Router)
- Tailwind CSS + shadcn/ui
- NextAuth.js

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
| `NEXT_PUBLIC_API_URL` | relay-api base URL (e.g. `https://api.bitmacro.io`) |

---

## Architecture

```
relay-panel (this repo)
    │  HTTP + JWT
    ▼
relay-api (central hub)
    │  Bearer token
    ▼
relay-agent(s)
```

---

## License

Business Source License 1.1 (BSL-1.1). See [LICENSE](LICENSE).
