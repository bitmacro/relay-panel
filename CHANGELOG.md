# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.7] - 2026-04-07

### Added

- Landing page: responsive nav (mobile Sheet), touch-friendly CTAs and footer
- Panel shell: mobile sidebar as drawer, relay quick chips, compact header
- Local dev: `AUTH_SECRET` optional placeholder with console warning
- Local dev: default relay-api `https://relay-api.bitmacro.io` when upstream URL unset
- `RELAY_API_ALLOW_LOCALHOST_UPSTREAM` to opt into localhost relay-api in dev

### Changed

- Onboarding: fix hydration mismatch for suggested agent token (UUID after mount)
- relay-api base URL: in `next dev`, loopback `NEXT_PUBLIC_API_URL` / `RELAY_API_URL` is ignored unless opt-in flag (avoids proxying to `localhost:3000` by mistake)

### Fixed

- NextAuth `MissingSecret` when running `next dev` without `.env`

## [0.2.2] - 2026-03-23

### Changed

- Landing page: premium layout (glass, elevation, glow, scroll reveal)
- HowItWorks: centered flow, gradient borders, hover effects
- Hero: panel screenshot aspect 2:1, object-contain (no crop)
- README: link to landing page, screenshot

## [0.2.1] - 2026-03-22

### Added

- Public landing page at / (Hero, Problem, HowItWorks, Features, QuickStart)
- BitMacro logo in TopNav, signin, Footer

### Changed

- Redesign v0.2.1: sidebar layout, relay table, theme toggle

## [0.2.0] - 2026-03-22

### Added

- Relay selector: choose which relay to view (multi-relay support)
- Create relay form in content area (styled like Config tab)
- Agent Relay ID field on relay creation
- Relay color picker and persistence of selected relay (localStorage)

### Changed

- Create form moved from top bar into main content component
- Compatible with relay-agent v0.2 and relay-api multi-relay endpoints

## [0.1.0] - 2026-03-21

### Added

- Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, shadcn/ui
- NextAuth.js v5 with GitHub provider
- Dashboard: stats (total events, DB size, uptime), activity by kind
- Events tab: browse and filter events
- Access tab: whitelist management, block/allow pubkeys, users list
- Config tab: edit relay endpoint/token/name, add new relays, delete
- Probe / "Verificar conexão" button
- BitMacro logo and DM Sans 700 in header
- Consumes relay-api only (no direct agent/Supabase access)
