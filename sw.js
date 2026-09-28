-- Aprende+ — reconstrução limpa de CONTAS + PIX no Supabase
-- Execute este arquivo inteiro no SQL Editor do seu projeto.
-- Ele recria apenas as duas tabelas usadas para sincronização.
-- NÃO armazena senhas.

create extension if not exists pgcrypto;

drop table if exists public.ap_solicitacoes_pix;
drop table if exists public.ap_contas_alunos;

create table public.ap_contas_alunos (
  email text primary key,
  name text not null default 'Aluno',
  premium_code text,
  premium boolean not null default false,
  state jsonb not null default '{"done":[],"xp":0,"answers":[]}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.ap_solicitacoes_pix (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Aluno',
  email text not null,
  code text not null,
  status text not null default 'aguardando',
  created_at timestamptz not null default now()
);

alter table public.ap_contas_alunos enable row level security;
alter table public.ap_solicitacoes_pix enable row level security;

create policy "ap_contas_select"
on public.ap_contas_alunos for select
to anon, authenticated
using (true);

create policy "ap_contas_insert"
on public.ap_contas_alunos for insert
to anon, authenticated
with check (true);

create policy "ap_contas_update"
on public.ap_contas_alunos for update
to anon, authenticated
using (true)
with check (true);

create policy "ap_pix_select"
on public.ap_solicitacoes_pix for select
to anon, authenticated
using (true);

create policy "ap_pix_insert"
on public.ap_solicitacoes_pix for insert
to anon, authenticated
with check (true);

create policy "ap_pix_update"
on public.ap_solicitacoes_pix for update
to anon, authenticated
using (true)
with check (true);

create policy "ap_pix_delete"
on public.ap_solicitacoes_pix for delete
to anon, authenticated
using (true);

alter table public.ap_contas_alunos replica identity full;
alter table public.ap_solicitacoes_pix replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.ap_contas_alunos;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.ap_solicitacoes_pix;
  exception when duplicate_object then null;
  end;
end $$;

select 'OK — tabelas Aprende+ recriadas' as resultado;
