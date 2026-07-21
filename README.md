# 🍔 Gordin Lanches — Cardápio digital + pedidos por WhatsApp

Site de pedidos do **Gordin Lanches**: cardápio (lanches, hot dogs prensados e combos),
carrinho, busca de endereço por CEP, observação por item e envio do pedido direto no WhatsApp.
Inclui um **painel de administração** para incluir/editar/remover produtos.

Feito em **React + Vite**, empacotado em **um único `index.html`** (tudo embutido:
JS, CSS e a logo). Não precisa de servidor nem banco de dados.

---

## 🌐 Site publicado (GitHub Pages)

Servido pela pasta [`/docs`](./docs). Depois de ativar o Pages (veja abaixo), o endereço fica:

```
https://SEU-USUARIO.github.io/gordin-lanches/
```

### Como ativar o GitHub Pages (uma vez só)
1. No repositório, vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **Deploy from a branch**.
3. Selecione a branch **main** e a pasta **/docs**. Salve.
4. Aguarde ~1 minuto e acesse o endereço acima.

---

## ✏️ Como atualizar o cardápio (sem programar)

1. Abra o site e clique em **Administração** no rodapé (ou acesse `…github.io/gordin-lanches/#admin`).
2. Faça login, edite/adicione/remova produtos.
3. Clique em **⬇ Baixar site para publicar** — baixa um `gordin-lanches.html` com o cardápio novo.
4. No GitHub, entre em **`docs/`**, clique no `index.html` → **✎ (editar)** ou faça **Add file → Upload files**
   e substitua pelo arquivo baixado (renomeie para `index.html`).
5. Faça **Commit**. O Pages publica sozinho em ~1 minuto.

> A senha do painel fica no código do site (proteção client-side). Como o Pages gratuito exige
> repositório **público**, essa senha é visível para quem procurar. Ela serve para afastar o
> cliente comum, **não é segurança forte**. Para login de verdade, use a versão com backend.

---

## 🛠️ Rodar/editar o código (opcional, para desenvolvedores)

```bash
npm install        # instala dependências
npm run dev        # ambiente local em http://localhost:5173
npm run build      # gera dist/index.html (arquivo único)
```

Para publicar uma alteração de **código** (não de cardápio): rode `npm run build` e copie
`dist/index.html` para `docs/index.html`, depois faça commit.

### Onde mexer
- `src/data.js` — cardápio padrão, telefone, endereço, PIX, taxa e **login/senha do admin**.
- `src/App.jsx` — loja, carrinho, checkout e painel de administração.
- `src/index.css` — estilos (paleta preto/laranja/amarelo/vermelho).

---

## 📦 Estrutura

```
docs/index.html     → site publicado (build de produção, servido pelo Pages)
src/                → código-fonte (React)
index.html          → template do Vite (desenvolvimento)
vite.config.js      → build em arquivo único (vite-plugin-singlefile)
```

Sabor que enche e satisfaz! 🔥
