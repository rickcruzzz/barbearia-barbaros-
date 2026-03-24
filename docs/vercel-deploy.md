# Deploy na Vercel (site + painel admin)

O repositório tem **dois aplicativos**. Na Vercel você cria **dois projetos** apontando para o **mesmo repositório GitHub**, mudando só o **Root Directory** e as variáveis de ambiente.

## 1) Projeto: site público (Vite)

| Campo no painel Vercel | Valor |
|------------------------|--------|
| Framework Preset | **Other** (ou deixe em branco; o `vercel.json` da raiz define o build) |
| Root Directory | **`.`** (raiz do repo — deixe vazio / `.`) |
| Install Command | `pnpm install` (já está no [`vercel.json`](../vercel.json)) |
| Build Command | `pnpm run build` |
| Output Directory | `dist` |

**Variáveis de ambiente** (Settings → Environment Variables), para **Production** (e Preview se quiser):

| Nome | Onde obter |
|------|------------|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

Sem essas variáveis o `/agendar` não fala com o banco.

O [`vercel.json`](../vercel.json) inclui **rewrite** para `index.html` para o React Router funcionar em rotas como `/agendar` ao atualizar a página.

## 2) Projeto: Bárbaros Admin (Next.js)

| Campo no painel Vercel | Valor |
|------------------------|--------|
| Framework Preset | **Next.js** (detecção automática) |
| Root Directory | **`barbaros-admin`** (obrigatório) |
| Install Command | `pnpm install` |
| Build Command | `pnpm build` (padrão Next) |

**Variáveis de ambiente:**

| Nome | Onde obter |
|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Igual ao `VITE_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Igual ao `VITE_SUPABASE_ANON_KEY` |

Após o deploy, teste:

- `https://SEU-DOMINIO-ADMIN.vercel.app/login`
- `GET https://SEU-DOMINIO-ADMIN.vercel.app/api/ops/readiness`

## 3) Supabase (antes de ir a produção)

1. Aplicar as migrations em ordem (ver [`barbaros-admin/docs/go-live-runbook.md`](../barbaros-admin/docs/go-live-runbook.md)).
2. Em **Authentication → URL Configuration**, adicione as URLs do site e do admin (com `https://`) em **Redirect URLs** / **Site URL** conforme a documentação do Supabase Auth.

## 4) Erros comuns

- **Painel sem CSS / login feio:** o admin **não** é servido pela raiz do repo. O projeto Vercel do admin precisa ter Root Directory **`barbaros-admin`**.
- **404 em `/agendar` no site:** o projeto do site deve usar o `vercel.json` da **raiz** (não use Root Directory `barbaros-admin` para o Vite).
- **pnpm na Vercel:** os `package.json` declaram `packageManager` para o Corepack instalar o pnpm correto.

## 5) Domínios

Você pode usar dois subdomínios, por exemplo `www` para o site e `admin` para o painel, cada um ligado ao projeto correspondente em **Settings → Domains**.
