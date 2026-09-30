create extension if not exists pgcrypto;
do $$ begin create type public.app_role as enum ('admin','equipe','cliente'); exception when duplicate_object then null; end $$;

create table if not exists public.user_roles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id,role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
drop policy if exists roles_select_own on public.user_roles;
create policy roles_select_own on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create table public.pedidos(
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  token uuid not null unique default gen_random_uuid(),
  cliente_nome text not null check (char_length(btrim(cliente_nome)) between 2 and 100),
  cliente_telefone text not null check (cliente_telefone ~ '^[0-9]{10,13}$'),
  tipo text not null check (tipo in ('entrega','retirada')),
  endereco text check (endereco is null or char_length(endereco) <= 300),
  status text not null default 'recebido' check (status in ('recebido','confirmado','em_preparo','pronto','saiu_para_entrega','concluido','cancelado')),
  subtotal numeric(10,2) not null check (subtotal > 0),
  taxa_entrega numeric(10,2) not null default 0 check (taxa_entrega >= 0),
  total numeric(10,2) not null,
  observacoes text check (observacoes is null or char_length(observacoes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pedidos_total_ok check (total = subtotal + taxa_entrega),
  constraint pedidos_endereco_ok check (tipo = 'retirada' or char_length(btrim(coalesce(endereco,''))) >= 5),
  constraint pedidos_status_tipo_ok check (not (tipo = 'retirada' and status = 'saiu_para_entrega'))
);
create table public.pedido_itens(
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  nome text not null,
  categoria text not null default '',
  quantidade int not null check (quantidade between 1 and 50),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0),
  adicionais jsonb not null default '[]'::jsonb,
  retirar text,
  observacoes text,
  total numeric(10,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);
create index on public.pedido_itens(pedido_id);
create index on public.pedidos(created_at desc);

grant select on public.pedidos, public.pedido_itens to authenticated;
grant update (status) on public.pedidos to authenticated;
grant all on public.pedidos, public.pedido_itens to service_role;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
create policy pedidos_admin_select on public.pedidos for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy pedidos_admin_update on public.pedidos for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy itens_admin_select on public.pedido_itens for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.pedidos_touch() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger pedidos_touch before update on public.pedidos for each row execute function public.pedidos_touch();

-- Notifica o cliente (canal secreto pelo token) quando o status muda
create or replace function public.pedidos_notify() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform realtime.send(jsonb_build_object('status', new.status, 'updated_at', new.updated_at), 'status', 'pedido-' || new.token::text, false);
  return new;
exception when others then return new;
end $$;
create trigger pedidos_notify after update of status on public.pedidos for each row execute function public.pedidos_notify();

-- Criação pública e validada do pedido
create or replace function public.criar_pedido(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid; v_codigo text; v_token uuid; v_sub numeric(10,2) := 0; v_item jsonb; v_add jsonb;
  v_qtd int; v_unit numeric(10,2); v_adds numeric(10,2); v_tipo text := p->>'tipo';
  v_tel text := regexp_replace(coalesce(p->>'telefone',''), '\D', '', 'g');
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if jsonb_typeof(p->'itens') <> 'array' or jsonb_array_length(p->'itens') = 0 or jsonb_array_length(p->'itens') > 40 then
    raise exception 'Carrinho inválido';
  end if;
  for v_item in select * from jsonb_array_elements(p->'itens') loop
    v_qtd := (v_item->>'quantidade')::int; v_unit := (v_item->>'preco_unitario')::numeric;
    if v_qtd < 1 or v_qtd > 50 or v_unit < 0 or v_unit > 1000 then raise exception 'Item inválido'; end if;
    v_adds := 0;
    for v_add in select * from jsonb_array_elements(coalesce(v_item->'adicionais','[]'::jsonb)) loop
      if (v_add->>'preco')::numeric < 0 or (v_add->>'preco')::numeric > 100 then raise exception 'Adicional inválido'; end if;
      v_adds := v_adds + (v_add->>'preco')::numeric;
    end loop;
    v_sub := v_sub + (v_unit + v_adds) * v_qtd;
  end loop;

  loop
    v_codigo := 'PF-';
    for i in 1..6 loop v_codigo := v_codigo || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1); end loop;
    exit when not exists(select 1 from public.pedidos where codigo = v_codigo);
  end loop;

  insert into public.pedidos(codigo, cliente_nome, cliente_telefone, tipo, endereco, subtotal, taxa_entrega, total, observacoes)
  values (v_codigo, btrim(p->>'nome'), v_tel, v_tipo,
          case when v_tipo = 'entrega' then nullif(btrim(p->>'endereco'),'') end,
          v_sub, 0, v_sub, nullif(btrim(coalesce(p->>'observacoes','')),''))
  returning id, token into v_id, v_token;

  for v_item in select * from jsonb_array_elements(p->'itens') loop
    v_qtd := (v_item->>'quantidade')::int; v_unit := (v_item->>'preco_unitario')::numeric;
    select coalesce(sum((a->>'preco')::numeric),0) into v_adds from jsonb_array_elements(coalesce(v_item->'adicionais','[]'::jsonb)) a;
    insert into public.pedido_itens(pedido_id, nome, categoria, quantidade, preco_unitario, adicionais, retirar, observacoes, total)
    values (v_id, left(v_item->>'nome',120), left(coalesce(v_item->>'categoria',''),60), v_qtd, v_unit,
            coalesce(v_item->'adicionais','[]'::jsonb), nullif(left(coalesce(v_item->>'retirar',''),200),''),
            nullif(left(coalesce(v_item->>'observacoes',''),200),''), (v_unit + v_adds) * v_qtd);
  end loop;
  return jsonb_build_object('codigo', v_codigo, 'token', v_token);
end $$;

-- Consulta pública somente com código + token secreto
create or replace function public.obter_pedido(p_codigo text, p_token uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'codigo', o.codigo, 'status', o.status, 'tipo', o.tipo, 'cliente_nome', o.cliente_nome,
    'endereco', o.endereco, 'subtotal', o.subtotal, 'taxa_entrega', o.taxa_entrega, 'total', o.total,
    'observacoes', o.observacoes, 'created_at', o.created_at, 'updated_at', o.updated_at,
    'itens', coalesce((select jsonb_agg(jsonb_build_object('nome',i.nome,'quantidade',i.quantidade,'preco_unitario',i.preco_unitario,'adicionais',i.adicionais,'retirar',i.retirar,'observacoes',i.observacoes,'total',i.total) order by i.created_at) from public.pedido_itens i where i.pedido_id = o.id), '[]'::jsonb))
  from public.pedidos o where o.codigo = upper(p_codigo) and o.token = p_token
$$;

revoke all on function public.criar_pedido(jsonb) from public;
revoke all on function public.obter_pedido(text, uuid) from public;
grant execute on function public.criar_pedido(jsonb) to anon, authenticated;
grant execute on function public.obter_pedido(text, uuid) to anon, authenticated;

alter publication supabase_realtime add table public.pedidos;
alter publication supabase_realtime add table public.pedido_itens;