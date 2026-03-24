# Bárbaros Admin

Painel administrativo separado do site público, usando Next.js 14 + Supabase.

## Rodando localmente

```bash
pnpm install
pnpm dev
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sem as variáveis, o projeto roda em modo mockado para desenvolvimento de UI.

## Banco de dados (Supabase)

- Migração inicial: `supabase/migrations/001_initial_schema.sql`
- Seed base: `supabase/seed.sql`
- Go-live completo: `docs/go-live-runbook.md`

## Health e readiness

- `GET /api/auth/health`
- `GET /api/ops/readiness`

## Rotas principais

- `/login`
- `/dashboard`
- `/agenda`
- `/clientes`
- `/servicos`
- `/barbeiros`
- `/financeiro`
- `/configuracoes`
