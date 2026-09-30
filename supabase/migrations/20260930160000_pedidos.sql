-- Sistema de pedidos online, sem e-mail
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('PF-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  token_publico uuid not null unique default gen_random_uuid(),
  cliente_nome text not null check (char_length(trim(cliente_nome)) between 2 and 120),
  cliente_telefone text not null check (char_length(trim(cliente_telefone)) between 8 and 30),
  tipo text not null check (tipo in ('entrega','retirada')),
  endereco text,
  observacoes text,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  taxa_entrega numeric(10,2) not null default 0 check (taxa_entrega >= 0),
  total numeric(10,2) not null check (total = subtotal + taxa_entrega),
  status text not null default 'recebido' check (status in ('recebido','confirmado','em_preparo','pronto','saiu_para_entrega','concluido','cancelado')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint endereco_entrega check (tipo <> 'entrega' or char_length(trim(coalesce(endereco,''))) >= 5)
);

create table if not exists public.pedido_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  nome text not null,
  categoria text,
  quantidade integer not null check (quantidade > 0 and quantidade <= 99),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0),
  total numeric(10,2) not null check (total = preco_unitario * quantidade),
  adicionais text[] not null default '{}',
  removidos text,
  observacoes text,
  criado_em timestamptz not null default now()
);

create index if not exists pedidos_status_idx on public.pedidos(status);
create index if not exists pedidos_criado_em_idx on public.pedidos(criado_em desc);
create index if not exists pedido_itens_pedido_id_idx on public.pedido_itens(pedido_id);

alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;

drop policy if exists "pedidos_public_insert" on public.pedidos;
create policy "pedidos_public_insert" on public.pedidos
for insert to anon, authenticated
with check (true);

drop policy if exists "pedidos_public_select_token" on public.pedidos;
create policy "pedidos_public_select_token" on public.pedidos
for select to anon, authenticated
using (token_publico = token_publico);

drop policy if exists "pedidos_admin_select" on public.pedidos;
create policy "pedidos_admin_select" on public.pedidos
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists "pedidos_admin_update" on public.pedidos;
create policy "pedidos_admin_update" on public.pedidos
for update to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'))
with check (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

drop policy if exists "pedido_itens_public_insert" on public.pedido_itens;
create policy "pedido_itens_public_insert" on public.pedido_itens
for insert to anon, authenticated
with check (exists (select 1 from public.pedidos p where p.id = pedido_id));

drop policy if exists "pedido_itens_public_select_token" on public.pedido_itens;
create policy "pedido_itens_public_select_token" on public.pedido_itens
for select to anon, authenticated
using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.token_publico = p.token_publico));

drop policy if exists "pedido_itens_admin_select" on public.pedido_itens;
create policy "pedido_itens_admin_select" on public.pedido_itens
for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'));

create or replace function public.atualizar_pedido_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists pedidos_atualizado_em on public.pedidos;
create trigger pedidos_atualizado_em before update on public.pedidos
for each row execute function public.atualizar_pedido_em();

alter table public.pedidos replica identity full;
alter table public.pedido_itens replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.pedidos;
exception when duplicate_object then null;
end $$;
-- Correção de segurança: clientes não recebem SELECT direto das tabelas.
drop policy if exists "pedidos_public_select_token" on public.pedidos;
drop policy if exists "pedido_itens_public_select_token" on public.pedido_itens;

create or replace function public.criar_pedido_publico(pedido jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  novo public.pedidos;
  item jsonb;
begin
  insert into public.pedidos (
    cliente_nome, cliente_telefone, tipo, endereco, observacoes,
    subtotal, taxa_entrega, total
  )
  values (
    trim(pedido->>'cliente_nome'),
    trim(pedido->>'cliente_telefone'),
    pedido->>'tipo',
    nullif(trim(coalesce(pedido->>'endereco','')), ''),
    nullif(trim(coalesce(pedido->>'observacoes','')), ''),
    (pedido->>'subtotal')::numeric,
    coalesce((pedido->>'taxa_entrega')::numeric, 0),
    (pedido->>'total')::numeric
  )
  returning * into novo;

  for item in select * from jsonb_array_elements(coalesce(pedido->'itens','[]'::jsonb))
  loop
    insert into public.pedido_itens (
      pedido_id, nome, categoria, quantidade, preco_unitario, total,
      adicionais, removidos, observacoes
    )
    values (
      novo.id,
      item->>'nome',
      item->>'categoria',
      (item->>'quantidade')::integer,
      (item->>'preco_unitario')::numeric,
      (item->>'total')::numeric,
      coalesce(array(select jsonb_array_elements_text(coalesce(item->'adicionais','[]'::jsonb))), '{}'),
      nullif(item->>'removidos',''),
      nullif(item->>'observacoes','')
    );
  end loop;

  return jsonb_build_object(
    'id', novo.id,
    'codigo', novo.codigo,
    'token_publico', novo.token_publico,
    'status', novo.status,
    'total', novo.total
  );
end;
$$;

create or replace function public.consultar_pedido_publico(p_token uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'codigo', p.codigo,
    'cliente_nome', p.cliente_nome,
    'tipo', p.tipo,
    'status', p.status,
    'subtotal', p.subtotal,
    'taxa_entrega', p.taxa_entrega,
    'total', p.total,
    'criado_em', p.criado_em,
    'atualizado_em', p.atualizado_em,
    'itens', coalesce((
      select jsonb_agg(jsonb_build_object(
        'nome', i.nome,
        'quantidade', i.quantidade,
        'preco_unitario', i.preco_unitario,
        'total', i.total,
        'adicionais', i.adicionais,
        'removidos', i.removidos,
        'observacoes', i.observacoes
      ) order by i.criado_em)
      from public.pedido_itens i where i.pedido_id = p.id
    ), '[]'::jsonb)
  )
  from public.pedidos p
  where p.token_publico = p_token;
$$;

revoke all on function public.criar_pedido_publico(jsonb) from public;
grant execute on function public.criar_pedido_publico(jsonb) to anon, authenticated;
revoke all on function public.consultar_pedido_publico(uuid) from public;
grant execute on function public.consultar_pedido_publico(uuid) to anon, authenticated;
-- O cliente cria o pedido e seus itens exclusivamente pela função segura acima.
drop policy if exists "pedidos_public_insert" on public.pedidos;
drop policy if exists "pedido_itens_public_insert" on public.pedido_itens;
