# Contributing to relay-panel

Thank you for your interest in contributing to relay-panel.

## Local setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bitmacro/relay-panel.git
   cd relay-panel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and configure:
   ```bash
   cp .env.example .env.local
   ```
   Set `NEXTAUTH_SECRET` and `NEXT_PUBLIC_API_URL` (relay-api base URL).

## Dev mode

```bash
npm run dev
```

## PR process

1. Fork the repository
2. Create a branch with a descriptive name:
   - `feat/` — new features
   - `fix/` — bug fixes
   - `chore/` — maintenance, docs
3. Make your changes
4. Ensure `npm run build` and `npm run lint` pass
5. Open a PR against `main`
6. Wait for CI and review

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance
- `docs:` — documentation

## Related projects

- [relay-agent](https://github.com/bitmacro/relay-agent) — REST API agent for strfry (OSS/MIT)
- [relay-api](https://github.com/bitmacro/relay-api) — Central hub (private)

## What we do NOT accept

- Breaking changes to the relay-api contract without coordination
- Heavy dependencies that bloat the bundle
- Code that bypasses relay-api to talk directly to agents or Supabase
