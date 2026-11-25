-- Plano 25 Dias — estrutura inicial
-- Rode este arquivo inteiro no SQL Editor do Supabase.

-- ===== Tipos =====
create type public.meal_type as enum ('cafe_da_manha', 'almoco', 'lanche', 'jantar', 'extra');
create type public.workout_type as enum ('forca', 'cardio', 'caminhada', 'descanso');

-- ===== Função auxiliar para updated_at =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ===== settings =====
create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  start_date date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  start_weight_kg numeric(5,2) not null default 98.25 check (start_weight_kg between 30 and 400),
  target_loss_kg numeric(5,2) not null default 7 check (target_loss_kg > 0 and target_loss_kg < 100),
  kcal_min int not null default 1800 check (kcal_min between 500 and 10000),
  kcal_max int not null default 2000 check (kcal_max between 500 and 10000),
  protein_goal_g int not null default 150 check (protein_goal_g between 0 and 1000),
  water_goal_ml int not null default 3000 check (water_goal_ml between 0 and 20000),
  steps_goal int not null default 8000 check (steps_goal between 0 and 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kcal_min <= kcal_max)
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ===== weight_logs =====
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  weight_kg numeric(5,2) not null check (weight_kg between 30 and 400),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ===== meals =====
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  meal_type public.meal_type not null,
  description text not null,
  kcal int not null default 0 check (kcal >= 0),
  protein_g int not null default 0 check (protein_g >= 0),
  created_at timestamptz not null default now()
);

create index meals_user_date_idx on public.meals (user_id, log_date);

-- ===== daily_checklist =====
create table public.daily_checklist (
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  water_ml int not null default 0 check (water_ml >= 0),
  steps int not null default 0 check (steps >= 0),
  workout_done boolean not null default false,
  workout_type public.workout_type,
  sleep_hours numeric(4,1) check (sleep_hours is null or sleep_hours between 0 and 24),
  note text,
  primary key (user_id, log_date)
);

-- ===== RLS =====
alter table public.settings enable row level security;
alter table public.weight_logs enable row level security;
alter table public.meals enable row level security;
alter table public.daily_checklist enable row level security;

-- settings
create policy "settings_select" on public.settings for select using (user_id = (select auth.uid()));
create policy "settings_insert" on public.settings for insert with check (user_id = (select auth.uid()));
create policy "settings_update" on public.settings for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "settings_delete" on public.settings for delete using (user_id = (select auth.uid()));

-- weight_logs
create policy "weight_logs_select" on public.weight_logs for select using (user_id = (select auth.uid()));
create policy "weight_logs_insert" on public.weight_logs for insert with check (user_id = (select auth.uid()));
create policy "weight_logs_update" on public.weight_logs for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "weight_logs_delete" on public.weight_logs for delete using (user_id = (select auth.uid()));

-- meals
create policy "meals_select" on public.meals for select using (user_id = (select auth.uid()));
create policy "meals_insert" on public.meals for insert with check (user_id = (select auth.uid()));
create policy "meals_update" on public.meals for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "meals_delete" on public.meals for delete using (user_id = (select auth.uid()));

-- daily_checklist
create policy "daily_checklist_select" on public.daily_checklist for select using (user_id = (select auth.uid()));
create policy "daily_checklist_insert" on public.daily_checklist for insert with check (user_id = (select auth.uid()));
create policy "daily_checklist_update" on public.daily_checklist for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "daily_checklist_delete" on public.daily_checklist for delete using (user_id = (select auth.uid()));

-- ===== Permissões da API (necessárias mesmo que o projeto não conceda automaticamente) =====
-- A RLS acima continua restringindo cada usuário aos próprios dados.
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.settings to authenticated;
grant select, insert, update, delete on public.weight_logs to authenticated;
grant select, insert, update, delete on public.meals to authenticated;
grant select, insert, update, delete on public.daily_checklist to authenticated;

-- ===== Trigger: cria settings padrão para cada novo usuário =====
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.settings (user_id, start_date)
  values (new.id, (now() at time zone 'America/Sao_Paulo')::date)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
