-- ============================================================
--  GORDIN LANCHES — Banco de dados (Supabase)
--  Cole TUDO isto no SQL Editor do Supabase e clique em RUN.
-- ============================================================

create table if not exists public.produtos (
  id         text primary key,
  cat        text not null,
  nome       text not null default '',
  descricao  text not null default '',
  preco      numeric(10,2) not null default 0,
  destaque   boolean not null default false,
  ordem      integer not null default 0,
  criado_em  timestamptz not null default now()
);

alter table public.produtos enable row level security;

drop policy if exists "leitura publica" on public.produtos;
create policy "leitura publica" on public.produtos
  for select using (true);

drop policy if exists "escrita autenticada" on public.produtos;
create policy "escrita autenticada" on public.produtos
  for all to authenticated using (true) with check (true);

-- Atualizacao em tempo real
alter publication supabase_realtime add table public.produtos;

-- Cardapio atual (seed)
insert into public.produtos (id, cat, nome, descricao, preco, destaque, ordem) values
  ('l1','lanches','Misto','Presunto e muçarela.',10.00,false,0),
  ('l2','lanches','Bauru','Presunto, muçarela, orégano e tomate.',12.00,false,1),
  ('l3','lanches','Cheeseburger','Hambúrguer, presunto, muçarela, ketchup e maionese.',13.00,false,2),
  ('l4','lanches','X-Salada','Alface, tomate, hambúrguer de 90g, presunto, muçarela, ketchup e maionese.',17.00,false,3),
  ('l5','lanches','X-Egg','Alface, tomate, hambúrguer de 90g, ovo, presunto, muçarela, ketchup e maionese.',18.00,false,4),
  ('l6','lanches','X-Bacon','Alface, tomate, hambúrguer de 90g, bacon, presunto, muçarela, ketchup e maionese.',19.00,false,5),
  ('l7','lanches','X-Calabresa','Alface, tomate, hambúrguer de 90g, calabresa, presunto, muçarela, ketchup e maionese.',19.00,false,6),
  ('l8','lanches','X-Calabacon','Alface, tomate, hambúrguer de 90g, calabresa, bacon e muçarela, ketchup e maionese.',22.00,false,7),
  ('l9','lanches','X-Tudo','Alface, tomate, hambúrguer de 90g, bacon, calabresa, ovo, presunto, muçarela, ketchup e maionese.',28.00,true,8),
  ('h1','hotdogs','Hot Simples','Pão de hot dog, salsicha, batata palha e maionese da casa.',12.00,false,9),
  ('h2','hotdogs','Hot Salada','Pão de hot dog, salsicha, alface, tomate, batata palha e maionese da casa.',15.00,false,10),
  ('h3','hotdogs','Hot Salada Duplo','Pão de hot dog, duas salsichas, alface, tomate, batata palha e maionese da casa.',19.90,false,11),
  ('h4','hotdogs','Hot Pizza','Pão de hot dog, salsicha, presunto, muçarela, tomate, orégano, batata palha e maionese da casa.',22.90,false,12),
  ('h5','hotdogs','Hot Frango','Pão de hot dog, salsicha, frango desfiado, alface, tomate, batata palha e maionese da casa.',24.90,false,13),
  ('c1','combos','Combo 3 Hot Dogs Simples','3x pão de hot dog, salsicha, batata palha, ketchup e maionese.',26.00,false,14),
  ('c2','combos','Combo 3 Cheeseburguer','3x hambúrguer de 90g, presunto, muçarela, ketchup e maionese.',29.00,false,15),
  ('c3','combos','Combo 3 X-Salada','3x alface, tomate, hambúrguer de 90g, presunto, muçarela, ketchup e maionese.',33.00,false,16),
  ('c4','combos','Combo 3 X-Egg','3x alface, tomate, ovo, presunto, muçarela, ketchup e maionese.',38.00,false,17),
  ('c5','combos','Combo 3 X-Bacon','3x alface, tomate, hambúrguer de 90g, bacon, presunto, muçarela, ketchup e maionese.',43.00,false,18),
  ('c6','combos','Combo 3 X-Tudo','3x alface, tomate, hambúrguer de 90g, bacon, calabresa, ovo, presunto, muçarela, ketchup e maionese.',60.00,true,19)
on conflict (id) do nothing;
