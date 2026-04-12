# Next steps / roadmap

Updated list reflecting what is already implemented.

---

## Done

### Panel / Access

- [x] **Access tab** with live data (policy + users from the API)
- [x] Filter comments and invalid pubkeys from the whitelist
- [x] Relay without whitelist: show users from events (source “events”)
- [x] Allow/block toggle only for whitelist entries
- [x] npub and hex support when adding a pubkey

### Panel / Config

- [x] Config editing (PATCH) with 300s timeout and `RELAY_API_URL`
- [x] Non-JSON response handling (Vercel timeout → readable message)
- [x] Delete relay

### Panel / Dashboard

- [x] **Activity by kind** from live data (event sample via `/events`)
- [x] Human-readable uptime (days/hours/minutes)
- [x] **Unique pubkeys** and **Blocked** with real counts (`GET /users` and `GET /policy/blocked`, per-card loading)

### Panel / Probe

- [x] **Probe in the panel** — onboarding (`/api/relay/probe`) and Config tab (`/api/relay/[id]/probe`) with error-type messages

### relay-api

- [x] Proxy for policy, users, block, allow
- [x] `maxDuration` 300s for functions

### relay-agent

- [x] `GET /policy` with comment and invalid-pubkey filtering

### CORS / domains

- [x] relay-agent: CORS for `relay-panel.bitmacro.io`

---

## Pending

### 1. Domain migration (.io → .cloud / .pro)

- [ ] Update agent endpoints (e.g. `agent-public.bitmacro.cloud`, `agent-paid.bitmacro.pro`)
- [ ] Update Supabase (`relay_configs.endpoint`)
- [ ] Update DNS / SSL

### 2. Operations and observability

- [ ] Alerts (Uptime Robot, Better Stack, etc.) for relay-api and public agents
- [ ] Review Vercel logs and error alerting

### 3. Documentation

- [ ] Quick guide for adding new relays
- [ ] Usage examples (curl, Postman) with API keys

---

## Up next / backlog

- [ ] Historical metrics (charts for events and DB size over time)
- [ ] Dark / light mode
- [ ] More specific errors (timeout vs relay not found vs network)
- [ ] Next.js 16 — migrate from deprecated `middleware` convention to `proxy`
- [ ] relay-api README: endpoints, authentication, environment variables
- [ ] Optional: “probing” indicator before selecting a relay in the main list (probe already exists in onboarding and Config)

---

## Suggested priority

1. **Documentation** — onboarding and operations
2. **Domain migration** — if `.cloud` / `.pro` are the target
3. **Observability** — production alerts
4. **Polish** — dark/light, richer errors, historical metrics, middleware migration
