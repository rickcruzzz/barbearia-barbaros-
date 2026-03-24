# Go-Live Runbook (Venda)

LLM em operacao: GPT-5.3 Codex.

## 1) Deploy e dominio
- Publicar `barbaros-admin` em ambiente de producao (Vercel ou equivalente).
- Configurar dominio final com HTTPS obrigatorio.
- Garantir variaveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2) Banco, RLS e migrations
- Aplicar todas as migrations na ordem:
  - `001_initial_schema.sql`
  - `002_harden_rls.sql`
  - `003_public_appointments_availability.sql`
  - `004_public_clients_insert_grant.sql`
  - `005_appointments_audit_logs.sql`
  - `006_barbershop_governance_policies.sql`
  - `007_storage_barber_photos.sql`
  - `008_booking_constraints.sql`
- Popular `user_roles` com usuarios reais (`admin` e `barbeiro`).

## 3) Healthcheck e readiness
- Verificar endpoint:
  - `GET /api/auth/health`
  - `GET /api/ops/readiness`
- So considerar go-live com `ok: true` em readiness.

## 4) Teste ponta a ponta obrigatorio
- Site publico:
  - novo agendamento em `/agendar`
  - validacao de disponibilidade e envio
- Painel admin:
  - visualizar agendamento no dashboard/agenda
  - editar status
  - validar trilha de auditoria
  - cadastro/edicao de barbeiro com upload de foto

## 5) Monitoramento minimo
- Monitorar:
  - taxa de erro 5xx em APIs
  - latencia de `/api/appointments`, `/api/barbers`, `/api/clients`
  - falhas de login
- Alertas recomendados:
  - erro 5xx > 2% por 5 min
  - readiness != ok

## 6) Backup e restauracao
- Snapshot diario do Postgres.
- Teste de restauracao em ambiente de homologacao 1x por semana.
- Procedimento de rollback documentado antes do go-live.

## 7) Criterio final de venda
- Fluxo completo operando sem erro em producao.
- Acesso admin por papel validado.
- Fotos de barbeiro via storage funcionando.
- Readiness verde e monitoramento ativo.
