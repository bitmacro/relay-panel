# COPY — relay-panel.bitmacro.io

Não havia inventário. Data da leitura: 18 nov 2026 (actualizado na rodada de compliance).

## Labels

- `src/messages/pt-BR.json` (completo)
- `src/messages/en.json`
- `src/messages/es.overrides.json` (só o que difere; o resto cai no pt-BR ou no merge do projeto)

A landing pública é o bloco `landing`. O painel autenticado é o resto do JSON (relays, eventos, política, onboarding).

## Landing (pt-BR)

| Key | Texto |
|-----|-------|
| landing.hero.title | Gerir o teu relay Nostr sem usar o terminal |
| landing.hero.subtitle | Painel visual para operadores — moderação, controlo de acesso, Lightning e multi-relay num só sítio. |
| landing.features.f3d | Acesso automático após pagamento, webhook LNbits |
| landing.cta.title | Começa a gerir o teu relay hoje |
| landing.cta.subtitle | Crie a conta com GitHub. Sem cartão. |
| landing.opensource.footer | relay-agent e relay-connect são MIT. relay-panel está visível sob BSL 1.1. |

Não há aconselhamento de investimento. Não há promessa “grátis para 1 relay” no código actual. A CTA diz “Sem cartão”. Pagamentos Lightning aparecem como funcionalidade de acesso a relay.
