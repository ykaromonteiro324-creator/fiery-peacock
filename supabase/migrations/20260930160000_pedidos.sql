create table if not exists public.pedidos_online (
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
  atualizado_em timestamptz not null default now()
);

create table if not exists public.pedido_itens_online (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_online(id) on delete cascade,
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

create index if not exists pedidos_online_status_idx on public.pedidos_online(status);
create index if not exists pedidos_online_criado_em_idx on public.pedidos_online(criado_em desc);
create index if not exists pedido_itens_online_pedido_id_idx on public.pedido_itens_online(pedido_id);

alter table public.pedidos_online enable row level security;
alter table public.pedido_itens_online enable row level security;

drop policy if exists "pedidos_online_admin_select" on public.pedidos_online;
create policy "pedidos_online_admin_select" on public.pedidos_online for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

drop policy if exists "pedidos_online_admin_update" on public.pedidos_online;
create policy "pedidos_online_admin_update" on public.pedidos_online for update to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'))
with check (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

drop policy if exists "pedido_itens_online_admin_select" on public.pedido_itens_online;
create policy "pedido_itens_online_admin_select" on public.pedido_itens_online for select to authenticated
using (exists (select 1 from public.user_roles ur where ur.user_id=auth.uid() and ur.role='admin'));

create or replace function public.atualizar_pedido_online_em()
returns trigger language plpgsql set search_path=public as $$
begin new.atualizado_em=now(); return new; end $$;

drop trigger if exists pedidos_online_atualizado_em on public.pedidos_online;
create trigger pedidos_online_atualizado_em before update on public.pedidos_online
for each row execute function public.atualizar_pedido_online_em();

create or replace function public.criar_pedido_publico(pedido jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare novo public.pedidos_online; item jsonb;
begin
  if jsonb_array_length(coalesce(pedido->'itens','[]'::jsonb))=0 then raise exception 'O pedido precisa ter itens'; end if;
  insert into public.pedidos_online(cliente_nome,cliente_telefone,tipo,endereco,observacoes,subtotal,taxa_entrega,total)
  values(trim(pedido->>'cliente_nome'),trim(pedido->>'cliente_telefone'),pedido->>'tipo',nullif(trim(coalesce(pedido->>'endereco','')),''),nullif(trim(coalesce(pedido->>'observacoes','')),''),(pedido->>'subtotal')::numeric,coalesce((pedido->>'taxa_entrega')::numeric,0),(pedido->>'total')::numeric)
  returning * into novo;
  for item in select * from jsonb_array_elements(pedido->'itens') loop
    insert into public.pedido_itens_online(pedido_id,nome,categoria,quantidade,preco_unitario,total,adicionais,removidos,observacoes)
    values(novo.id,item->>'nome',item->>'categoria',(item->>'quantidade')::integer,(item->>'preco_unitario')::numeric,(item->>'total')::numeric,coalesce(array(select jsonb_array_elements_text(coalesce(item->'adicionais','[]'::jsonb))),'{}'),nullif(item->>'removidos',''),nullif(item->>'observacoes',''));
  end loop;
  return jsonb_build_object('id',novo.id,'codigo',novo.codigo,'token_publico',novo.token_publico,'status',novo.status,'total',novo.total);
end $$;

create or replace function public.consultar_pedido_publico(p_token uuid)
returns jsonb language sql security definer set search_path=public as $$
select jsonb_build_object('id',p.id,'codigo',p.codigo,'cliente_nome',p.cliente_nome,'tipo',p.tipo,'status',p.status,'subtotal',p.subtotal,'taxa_entrega',p.taxa_entrega,'total',p.total,'criado_em',p.criado_em,'atualizado_em',p.atualizado_em,'itens',coalesce((select jsonb_agg(jsonb_build_object('nome',i.nome,'quantidade',i.quantidade,'preco_unitario',i.preco_unitario,'total',i.total,'adicionais',i.adicionais,'removidos',i.removidos,'observacoes',i.observacoes) order by i.criado_em) from public.pedido_itens_online i where i.pedido_id=p.id),'[]'::jsonb))
from public.pedidos_online p where p.token_publico=p_token $$;

revoke all on function public.criar_pedido_publico(jsonb) from public;
grant execute on function public.criar_pedido_publico(jsonb) to anon,authenticated;
revoke all on function public.consultar_pedido_publico(uuid) from public;
grant execute on function public.consultar_pedido_publico(uuid) to anon,authenticated;

alter table public.pedidos_online replica identity full;
do $$ begin alter publication supabase_realtime add table public.pedidos_online; exception when duplicate_object then null; end $$;