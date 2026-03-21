# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
