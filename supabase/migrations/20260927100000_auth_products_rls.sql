create extension if not exists pgcrypto;
do $$ begin create type public.app_role as enum ('admin','equipe','cliente'); exception when duplicate_object then null; end $$;
create table if not exists public.user_roles(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,role public.app_role not null,unique(user_id,role));
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,nome text,avatar_url text,criado_em timestamptz not null default now());
create table if not exists public.categorias(id uuid primary key default gen_random_uuid(),nome text not null,ordem int not null default 0,ativo boolean not null default true);
create table if not exists public.produtos(id uuid primary key default gen_random_uuid(),categoria_id uuid not null references public.categorias(id) on delete restrict,nome text not null,descricao text not null default '',preco numeric(10,2) not null check(preco>=0),preco_promocional numeric(10,2) null check(preco_promocional is null or preco_promocional>=0),imagens text[] not null default '{}',estoque int not null default 0 check(estoque>=0),ativo boolean not null default true,ordem int not null default 0,criado_em timestamptz not null default now(),atualizado_em timestamptz not null default now());
create or replace function public.has_role(_user_id uuid,_role public.app_role) returns boolean language sql stable security definer set search_path=public as 'select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)';
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as 'begin insert into public.profiles(id,nome) values(new.id,coalesce(new.raw_user_meta_data->>''nome'',new.raw_user_meta_data->>''full_name'')); return new; end';
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.set_updated_at() returns trigger language plpgsql as 'begin new.atualizado_em=now(); return new; end';
drop trigger if exists produtos_updated_at on public.produtos;
create trigger produtos_updated_at before update on public.produtos for each row execute procedure public.set_updated_at();

alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;

drop policy if exists roles_select_own on public.user_roles; create policy roles_select_own on public.user_roles for select to authenticated using(user_id=auth.uid());
drop policy if exists roles_admin_insert on public.user_roles; create policy roles_admin_insert on public.user_roles for insert to authenticated with check(public.has_role(auth.uid(),'admin'));
drop policy if exists roles_admin_update on public.user_roles; create policy roles_admin_update on public.user_roles for update to authenticated using(public.has_role(auth.uid(),'admin')) with check(public.has_role(auth.uid(),'admin'));
drop policy if exists roles_admin_delete on public.user_roles; create policy roles_admin_delete on public.user_roles for delete to authenticated using(public.has_role(auth.uid(),'admin'));

drop policy if exists profiles_select_own on public.profiles; create policy profiles_select_own on public.profiles for select to authenticated using(id=auth.uid());
drop policy if exists profiles_update_own on public.profiles; create policy profiles_update_own on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());

drop policy if exists categorias_public_select on public.categorias; create policy categorias_public_select on public.categorias for select to anon,authenticated using(ativo=true);
drop policy if exists categorias_admin_insert on public.categorias; create policy categorias_admin_insert on public.categorias for insert to authenticated with check(public.has_role(auth.uid(),'admin'));
drop policy if exists categorias_admin_update on public.categorias; create policy categorias_admin_update on public.categorias for update to authenticated using(public.has_role(auth.uid(),'admin')) with check(public.has_role(auth.uid(),'admin'));
drop policy if exists categorias_admin_delete on public.categorias; create policy categorias_admin_delete on public.categorias for delete to authenticated using(public.has_role(auth.uid(),'admin'));

drop policy if exists produtos_public_select on public.produtos; create policy produtos_public_select on public.produtos for select to anon,authenticated using(ativo=true);
drop policy if exists produtos_admin_insert on public.produtos; create policy produtos_admin_insert on public.produtos for insert to authenticated with check(public.has_role(auth.uid(),'admin'));
drop policy if exists produtos_admin_update on public.produtos; create policy produtos_admin_update on public.produtos for update to authenticated using(public.has_role(auth.uid(),'admin')) with check(public.has_role(auth.uid(),'admin'));
drop policy if exists produtos_admin_delete on public.produtos; create policy produtos_admin_delete on public.produtos for delete to authenticated using(public.has_role(auth.uid(),'admin'));

insert into storage.buckets(id,name,public) values('produtos','produtos',true) on conflict(id) do update set public=true;
drop policy if exists produtos_storage_read on storage.objects; create policy produtos_storage_read on storage.objects for select to anon,authenticated using(bucket_id='produtos');
drop policy if exists produtos_storage_insert on storage.objects; create policy produtos_storage_insert on storage.objects for insert to authenticated with check(bucket_id='produtos' and public.has_role(auth.uid(),'admin'));
drop policy if exists produtos_storage_update on storage.objects; create policy produtos_storage_update on storage.objects for update to authenticated using(bucket_id='produtos' and public.has_role(auth.uid(),'admin')) with check(bucket_id='produtos' and public.has_role(auth.uid(),'admin'));
drop policy if exists produtos_storage_delete on storage.objects; create policy produtos_storage_delete on storage.objects for delete to authenticated using(bucket_id='produtos' and public.has_role(auth.uid(),'admin'));

do $$ begin
 if to_regclass('public.pedidos') is not null then
  execute 'alter table public.pedidos enable row level security';
 end if;
 if to_regclass('public.agendamentos') is not null then
  execute 'alter table public.agendamentos enable row level security';
 end if;
 if to_regclass('public.leads') is not null then
  execute 'alter table public.leads enable row level security';
 end if;
end $$;
