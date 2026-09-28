-- ============================================================
-- Scriptorium — multi-autor com autoria própria (RLS)
-- Rode isso no SQL Editor do Supabase (Database > SQL Editor)
-- ============================================================

-- 1. Tabela de perfis de autor, 1:1 com auth.users (login/senha
--    reais ficam no Supabase Auth, essa tabela só guarda o que
--    é nosso: nome público, bio etc)
create table if not exists public.perfis_autor (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  bio text,
  criado_em timestamptz not null default now()
);

alter table public.perfis_autor enable row level security;

-- qualquer pessoa (logada ou não) pode ver o nome público dos autores
create policy "perfis_autor: leitura pública"
  on public.perfis_autor for select
  using (true);

-- só o próprio autor edita o próprio perfil
create policy "perfis_autor: autor edita o próprio"
  on public.perfis_autor for update
  using (auth.uid() = id);

-- trigger: ao criar um usuário no Supabase Auth, já cria o perfil
create or replace function public.criar_perfil_autor()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis_autor (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.criar_perfil_autor();


-- 2. Livro passa a ter dono (autor_id)
alter table public.livros
  add column if not exists autor_id uuid references public.perfis_autor (id) on delete cascade;

-- se já existirem livros antigos sem dono, dá pra atribuir manualmente depois:
-- update public.livros set autor_id = 'UUID-DO-AUTOR' where autor_id is null;

alter table public.livros enable row level security;

-- leitura pública de todos os livros (o acervo é aberto pra leitura)
drop policy if exists "livros: leitura pública" on public.livros;
create policy "livros: leitura pública"
  on public.livros for select
  using (true);

-- só autor autenticado cria livro, e só como dono de si mesmo
drop policy if exists "livros: autor cria o próprio" on public.livros;
create policy "livros: autor cria o próprio"
  on public.livros for insert
  with check (auth.uid() = autor_id);

-- só o dono edita ou apaga o próprio livro
drop policy if exists "livros: autor edita o próprio" on public.livros;
create policy "livros: autor edita o próprio"
  on public.livros for update
  using (auth.uid() = autor_id);

drop policy if exists "livros: autor apaga o próprio" on public.livros;
create policy "livros: autor apaga o próprio"
  on public.livros for delete
  using (auth.uid() = autor_id);


-- 3. Capítulos seguem o dono do livro (não têm autor_id próprio,
--    herdam a permissão através do livro pai)
alter table public.capitulos enable row level security;

drop policy if exists "capitulos: leitura pública" on public.capitulos;
create policy "capitulos: leitura pública"
  on public.capitulos for select
  using (true);

drop policy if exists "capitulos: dono do livro cria" on public.capitulos;
create policy "capitulos: dono do livro cria"
  on public.capitulos for insert
  with check (
    exists (
      select 1 from public.livros
      where livros.id = capitulos.livro_id
      and livros.autor_id = auth.uid()
    )
  );

drop policy if exists "capitulos: dono do livro edita" on public.capitulos;
create policy "capitulos: dono do livro edita"
  on public.capitulos for update
  using (
    exists (
      select 1 from public.livros
      where livros.id = capitulos.livro_id
      and livros.autor_id = auth.uid()
    )
  );

drop policy if exists "capitulos: dono do livro apaga" on public.capitulos;
create policy "capitulos: dono do livro apaga"
  on public.capitulos for delete
  using (
    exists (
      select 1 from public.livros
      where livros.id = capitulos.livro_id
      and livros.autor_id = auth.uid()
    )
  );

-- IMPORTANTE: garanta que a coluna capitulos.conteudo seja do tipo "text"
-- (sem limite de tamanho). Se ela foi criada como "varchar(n)", troque com:
-- alter table public.capitulos alter column conteudo type text;
