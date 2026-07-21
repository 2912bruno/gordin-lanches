# CLAUDE.md — Contexto do projeto Gordin Lanches

> Este arquivo é lido automaticamente pelo Claude Code em cada sessão. Mantenha-o atualizado
> sempre que tomar decisões, mudar arquitetura ou concluir pendências.

## Visão geral
Site de **cardápio digital + pedidos por WhatsApp** do **Gordin Lanches** (hamburgueria).
O cliente monta o pedido e envia direto no WhatsApp da loja. Há um **painel de administração**
para incluir/editar/remover produtos. Feito em **React + Vite**, empacotado em **um único
`index.html`** (tudo embutido: JS, CSS e logo em base64), para hospedagem estática gratuita.

- **Repositório:** https://github.com/2912bruno/gordin-lanches
- **Site publicado:** https://2912bruno.github.io/gordin-lanches/ (GitHub Pages, branch `main`, pasta `/docs`)
- **WhatsApp de pedidos:** 5518998166365 · **Endereço:** Rua José Luiz Mendes, 11

## Stack
- React 18 + Vite (plugin `@vitejs/plugin-react`)
- `framer-motion` (animações), `@supabase/supabase-js` (admin ao vivo)
- `vite-plugin-singlefile` (gera 1 arquivo `dist/index.html` autocontido)

## Estrutura
```
src/data.js        → CONFIG (telefone, endereço, PIX, taxa, adminLogin/adminSenha),
                     SUPABASE (url/anonKey), MENU (cardápio padrão), helpers e persistência
src/App.jsx        → App (roteamento #admin), Loja (cliente), Checkout, Admin
src/supabase.js    → cliente Supabase (null quando não configurado → fallback local)
src/index.css      → estilos (paleta preto/laranja/amarelo/vermelho)
src/assets/logo.png→ logo oficial recortada das artes
docs/index.html    → SITE PUBLICADO servido pelo GitHub Pages (é o artefato de deploy)
index.html         → template do Vite (desenvolvimento)
vite.config.js     → build single-file
supabase_setup.sql → schema + RLS + seed (rodar no SQL Editor do Supabase)
```

## Comandos
```bash
npm install        # dependências
npm run dev        # dev local (http://localhost:5173)
npm run build      # gera dist/index.html (arquivo único)
```
**Publicar uma alteração de código:**
```bash
npm run build
cp dist/index.html docs/index.html
git add -A && git commit -m "..." && git push
# GitHub Pages redeploya sozinho em ~1 min
```

## Dois modos do painel admin (rota `#admin`)
1. **Local (fallback)** — quando `SUPABASE.url`/`anonKey` estão vazios em `src/data.js`.
   - Login: `CONFIG.adminLogin` / `CONFIG.adminSenha` (atualmente `GORDIN` / `Julinha`), client-side.
   - Edições salvas em `localStorage`; publicar = botão "Baixar site para publicar" e substituir `docs/index.html`.
2. **Ao vivo (Supabase)** — quando `SUPABASE.url` e `SUPABASE.anonKey` estão preenchidos.
   - Login real via Supabase Auth (usuário criado em Authentication → Users).
   - Botão "Publicar ao vivo" grava na tabela `public.produtos`; clientes atualizam em **tempo real**.
   - `anonKey` é pública por design (protegida por RLS) — pode ficar no código.

## Cardápio = fonte de verdade
- Modo local: array `MENU` em `src/data.js`.
- Modo Supabase: tabela `public.produtos` (colunas: id, cat, nome, descricao, preco, destaque, ordem).
- Mapeamento app↔banco: `rowToItem` / `itemToRow` em `src/data.js`.

## Estado atual e PENDÊNCIAS
- ✅ Site no ar em **modo local**, funcionando (loja, carrinho, CEP via ViaCEP, obs. por item, admin local).
- ✅ Código do **admin ao vivo (Supabase)** pronto, testado no fallback e commitado (commit `026b21a`).
- ⏳ **PENDENTE ativar o Supabase:**
  1. Criar projeto no supabase.com e rodar `supabase_setup.sql` no SQL Editor.
  2. Criar usuário admin em Authentication → Users (e-mail + senha).
  3. Preencher `SUPABASE.url` e `SUPABASE.anonKey` em `src/data.js`.
  4. `npm run build` → `cp dist/index.html docs/index.html` → commit + push.
  5. Validar: login no `#admin`, "Publicar ao vivo", e confirmar atualização em outro dispositivo.

## Decisões técnicas
- **Single-file** para deploy grátis trivial (arrastar/GitHub Pages/Netlify).
- **GitHub Pages exige repo público** → a senha do admin no modo local fica visível no código;
  serve só para afastar clientes. Segurança real de login só no **modo Supabase**.
- Integrações externas em runtime: **ViaCEP** (busca de endereço) e **Google Fonts** — ambas HTTPS públicas.

## Convenções
- Responder e comentar em **português do Brasil**.
- Toda alteração visível ao usuário deve ser **validada no navegador** (Playwright/Chromium) antes de publicar.
- Preservar o que já funciona; ao mexer no cardápio, manter os preços exatos das artes originais.
