# Bárbaros Admin

Painel administrativo separado do site público, usando Next.js 14 + Supabase.

**Importante:** este app é independente do site Vite na raiz do monorepo. Sempre execute os comandos **dentro da pasta `barbaros-admin`**. Com `pnpm dev` (porta padrão do Next), o login fica em `http://localhost:3000/login`. Se outro processo (por exemplo o site público) estiver na porta 3000, o painel pode subir em outra porta ou parecer “sem CSS” — confira o terminal e use a URL que o Next exibir.

## Rodando localmente

```bash
cd barbaros-admin
pnpm install
pnpm dev
```

Build de produção (valida CSS e tipos):

```bash
cd barbaros-admin
pnpm build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sem as variáveis, o projeto roda em modo mockado para desenvolvimento de UI.

## Deploy na Vercel

No painel da Vercel, crie um projeto com **Root Directory** = `barbaros-admin` (Next.js detectado automaticamente) e as mesmas variáveis `NEXT_PUBLIC_*` em Production. Guia completo (site + admin): [`docs/vercel-deploy.md`](../docs/vercel-deploy.md).

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
