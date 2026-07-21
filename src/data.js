// ============================================================================
//  GORDIN LANCHES — FONTE ÚNICA DE VERDADE
//  Para editar preços, itens, telefone ou endereço, mude SÓ aqui embaixo.
// ============================================================================

export const CONFIG = {
  nome: 'Gordin Lanches',
  slogan: 'Sabor que enche e satisfaz!',
  // Telefone que RECEBE os pedidos (formato internacional, só números: 55 + DDD + número)
  whatsapp: '5518998166365',
  endereco: 'Rua José Luiz Mendes, 11',
  // Chave PIX (opcional). Se preencher, aparece automaticamente quando o cliente escolher PIX.
  pix: '',
  // Taxa de entrega em R$ (0 = combinar na entrega / grátis). Deixe 0 se não cobra fixo.
  taxaEntrega: 0,
  // Login do painel de administração (acesse pelo link "Administração" no rodapé).
  // Atenção: é proteção leve (client-side), só esconde o painel dos clientes.
  adminLogin: 'GORDIN',
  adminSenha: 'Julinha',
}

// ============================================================================
//  SUPABASE — Admin ao vivo (opcional)
//  Preencha url + anonKey para ativar o cardápio no banco de dados com login real
//  e atualização em tempo real. Deixe em branco para usar o modo local (fallback).
//  A anonKey é PÚBLICA por design (protegida por RLS) — pode ficar no código.
// ============================================================================
export const SUPABASE = {
  url: '',      // ex.: https://xxxxxxxx.supabase.co
  anonKey: '',  // ex.: eyJhbGciOi... (chave "anon public")
}
export const supabaseEnabled = () => !!(SUPABASE.url && SUPABASE.anonKey)

// Categorias exibidas no menu de navegação (ordem importa)
export const CATEGORIAS = [
  { id: 'lanches', nome: 'Lanches', icone: '🍔' },
  { id: 'hotdogs', nome: 'Hot Dogs', icone: '🌭' },
  { id: 'combos', nome: 'Combos', icone: '🔥' },
]

export const MENU = [
  // ---------------- LANCHES TRADICIONAIS ----------------
  { id: 'l1', cat: 'lanches', nome: 'Misto', desc: 'Presunto e muçarela.', preco: 10.0 },
  { id: 'l2', cat: 'lanches', nome: 'Bauru', desc: 'Presunto, muçarela, orégano e tomate.', preco: 12.0 },
  { id: 'l3', cat: 'lanches', nome: 'Cheeseburger', desc: 'Hambúrguer, presunto, muçarela, ketchup e maionese.', preco: 13.0 },
  { id: 'l4', cat: 'lanches', nome: 'X-Salada', desc: 'Alface, tomate, hambúrguer de 90g, presunto, muçarela, ketchup e maionese.', preco: 17.0 },
  { id: 'l5', cat: 'lanches', nome: 'X-Egg', desc: 'Alface, tomate, hambúrguer de 90g, ovo, presunto, muçarela, ketchup e maionese.', preco: 18.0 },
  { id: 'l6', cat: 'lanches', nome: 'X-Bacon', desc: 'Alface, tomate, hambúrguer de 90g, bacon, presunto, muçarela, ketchup e maionese.', preco: 19.0 },
  { id: 'l7', cat: 'lanches', nome: 'X-Calabresa', desc: 'Alface, tomate, hambúrguer de 90g, calabresa, presunto, muçarela, ketchup e maionese.', preco: 19.0 },
  { id: 'l8', cat: 'lanches', nome: 'X-Calabacon', desc: 'Alface, tomate, hambúrguer de 90g, calabresa, bacon e muçarela, ketchup e maionese.', preco: 22.0 },
  { id: 'l9', cat: 'lanches', nome: 'X-Tudo', desc: 'Alface, tomate, hambúrguer de 90g, bacon, calabresa, ovo, presunto, muçarela, ketchup e maionese.', preco: 28.0, destaque: true },

  // ---------------- HOT DOG PRENSADO ----------------
  { id: 'h1', cat: 'hotdogs', nome: 'Hot Simples', desc: 'Pão de hot dog, salsicha, batata palha e maionese da casa.', preco: 12.0 },
  { id: 'h2', cat: 'hotdogs', nome: 'Hot Salada', desc: 'Pão de hot dog, salsicha, alface, tomate, batata palha e maionese da casa.', preco: 15.0 },
  { id: 'h3', cat: 'hotdogs', nome: 'Hot Salada Duplo', desc: 'Pão de hot dog, duas salsichas, alface, tomate, batata palha e maionese da casa.', preco: 19.9 },
  { id: 'h4', cat: 'hotdogs', nome: 'Hot Pizza', desc: 'Pão de hot dog, salsicha, presunto, muçarela, tomate, orégano, batata palha e maionese da casa.', preco: 22.9 },
  { id: 'h5', cat: 'hotdogs', nome: 'Hot Frango', desc: 'Pão de hot dog, salsicha, frango desfiado, alface, tomate, batata palha e maionese da casa.', preco: 24.9 },

  // ---------------- COMBOS ESPECIAIS (3 UNIDADES) ----------------
  { id: 'c1', cat: 'combos', nome: 'Combo 3 Hot Dogs Simples', desc: '3x pão de hot dog, salsicha, batata palha, ketchup e maionese.', preco: 26.0 },
  { id: 'c2', cat: 'combos', nome: 'Combo 3 Cheeseburguer', desc: '3x hambúrguer de 90g, presunto, muçarela, ketchup e maionese.', preco: 29.0 },
  { id: 'c3', cat: 'combos', nome: 'Combo 3 X-Salada', desc: '3x alface, tomate, hambúrguer de 90g, presunto, muçarela, ketchup e maionese.', preco: 33.0 },
  { id: 'c4', cat: 'combos', nome: 'Combo 3 X-Egg', desc: '3x alface, tomate, ovo, presunto, muçarela, ketchup e maionese.', preco: 38.0 },
  { id: 'c5', cat: 'combos', nome: 'Combo 3 X-Bacon', desc: '3x alface, tomate, hambúrguer de 90g, bacon, presunto, muçarela, ketchup e maionese.', preco: 43.0 },
  { id: 'c6', cat: 'combos', nome: 'Combo 3 X-Tudo', desc: '3x alface, tomate, hambúrguer de 90g, bacon, calabresa, ovo, presunto, muçarela, ketchup e maionese.', preco: 60.0, destaque: true },
]

export const brl = (v) =>
  (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ============================================================================
//  PERSISTÊNCIA DO CARDÁPIO (para o painel de administração)
//  Prioridade: edições locais (localStorage) > cardápio publicado (seed) > padrão
// ============================================================================
const LS_KEY = 'gordin_menu_v1'

export function loadMenu() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const m = JSON.parse(raw)
      if (Array.isArray(m) && m.length) return m
    }
  } catch { /* localStorage indisponível: segue para o seed/padrão */ }
  try {
    if (typeof window !== 'undefined' && Array.isArray(window.__GORDIN_MENU__) && window.__GORDIN_MENU__.length) {
      return window.__GORDIN_MENU__
    }
  } catch { /* noop */ }
  return MENU.map((m) => ({ ...m }))
}

export function saveMenu(menu) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(menu)); return true } catch { return false }
}

export function clearMenu() {
  try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
}

export function novoId() {
  return 'p' + Math.random().toString(36).slice(2, 8) + (Date.now() % 100000)
}

// Conversão entre linha do banco (Supabase) e item do app
export function rowToItem(r) {
  return { id: r.id, cat: r.cat, nome: r.nome, desc: r.descricao || '', preco: Number(r.preco) || 0, destaque: !!r.destaque }
}
export function itemToRow(m, ordem) {
  return { id: m.id, cat: m.cat, nome: m.nome, descricao: m.desc || '', preco: Number(m.preco) || 0, destaque: !!m.destaque, ordem }
}
