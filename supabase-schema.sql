-- Execute este script no SQL Editor do seu projeto no Supabase (https://app.supabase.com)

-- 1. Tabela de Modelos Personalizados (Templates)
create table if not exists public.custom_templates (
  id text primary key,
  name text not null,
  category text default 'Meus Modelos',
  description text default '',
  palette jsonb not null,
  slides jsonb not null,
  is_custom boolean default true,
  created_at timestamptz default now()
);

-- 2. Tabela de Carrosséis Salvos (Histórico)
create table if not exists public.saved_carousels (
  id text primary key,
  name text not null,
  username text default '@usuário',
  avatar_url text,
  global_palette jsonb,
  slides jsonb not null,
  settings jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. Habilitar leitura e escrita pública (ou anônima) para acesso simples do app
alter table public.custom_templates enable row level security;
alter table public.saved_carousels enable row level security;

-- Políticas de acesso livre com a Anon Key
create policy "Acesso livre aos modelos" on public.custom_templates
  for all using (true) with check (true);

create policy "Acesso livre aos carrosséis" on public.saved_carousels
  for all using (true) with check (true);
