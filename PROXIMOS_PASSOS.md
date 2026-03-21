# Próximos passos sugeridos

Lista atualizada considerando o que já foi implementado.

---

## ✅ Concluído

### Painel / Acesso
- [x] **Aba Acesso** com dados reais (policy + users da API)
- [x] Filtro de comentários e pubkeys inválidas no whitelist
- [x] Relay sem whitelist: mostra utilizadores com eventos (origem "eventos")
- [x] Toggle allow/block só para entradas do whitelist
- [x] Suporte npub e hex ao adicionar pubkey

### Painel / Config
- [x] Edição de config (PATCH) com timeout 300s e RELAY_API_URL
- [x] Tratamento de resposta não-JSON (timeout Vercel → mensagem legível)
- [x] Delete relay

### Painel / Dashboard
- [x] **Atividade por kind** com dados reais (amostra de eventos via /events)
- [x] Uptime legível (dias/horas/minutos conforme valor)

### relay-api
- [x] Proxy para policy, users, block, allow
- [x] maxDuration 300s para funções

### relay-agent
- [x] GET /policy com filtro de comentários e pubkeys inválidas

### CORS / Domínios
- [x] Relay-agent: CORS para relay-panel.bitmacro.cloud, relay-panel.bitmacro.pro

---

## Pendente

### 1. Probe no painel
- [ ] Indicador de "probing" antes de selecionar o relay
- [ ] Ou botão "Verificar conexão" que chame `/relay/:id/probe`
- O endpoint existe em relay-api; o painel usa stats/health mas não probe

### 2. Migração de domínios (.io → .cloud / .pro)
- [ ] Atualizar endpoints nos agents (agent-public.bitmacro.cloud, agent-paid.bitmacro.pro)
- [ ] Ajustar Supabase (relay_configs.endpoint)
- [ ] Atualizar DNS/SSL

### 3. Operação e observabilidade
- [ ] Alertas (Uptime Robot, Better Uptime) para relay-api e agents públicos
- [ ] Revisar logs da Vercel e alertas em caso de erro

### 4. Documentação
- [ ] README da relay-api: endpoints, autenticação, variáveis de ambiente
- [ ] Guia rápido para adicionar novos relays
- [ ] Exemplos de uso (curl, Postman) com API key

### 5. Refino do painel
- [ ] Tratamento de erros mais específico (timeout vs relay não encontrado)
- [ ] Dark/light mode (atualmente só dark)
- [ ] Pubkeys ativas / Bloqueados — ainda "—" (dados mock)

---

## Sugestão de prioridade

1. **Probe no painel** — usa infra já existente, melhora UX
2. **Documentação** — ajuda onboarding e operação
3. **Migração de domínios** — se .cloud/.pro forem o alvo
4. **Observabilidade** — alertas para produção
5. **Refino** — dark/light, erros específicos, métricas em falta
