-- =========================================
-- BellaSalon — schema completo + RLS
-- =========================================

-- SALONS (vinculado ao usuário dono)
create table public.salons (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  owner_name text,
  email text,
  phone text,
  city text,
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create index salons_owner_idx on public.salons(owner_id);

-- Função de autorização (security definer evita recursão em policies)
create or replace function public.is_salon_owner(_salon_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.salons s
    where s.id = _salon_id and s.owner_id = auth.uid()
  )
$$;

-- EMPLOYEES
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  specialties text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index employees_salon_idx on public.employees(salon_id);

-- CLIENTS
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  phone text,
  visits_count integer not null default 0,
  last_visit timestamptz,
  favorite_service text,
  notes text,
  created_at timestamptz not null default now()
);
create index clients_salon_idx on public.clients(salon_id);

-- SERVICES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  duration_min integer not null default 60,
  price numeric(10,2) not null default 0,
  category text,
  created_at timestamptz not null default now()
);
create index services_salon_idx on public.services(salon_id);

-- APPOINTMENTS
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);
create index appointments_salon_idx on public.appointments(salon_id);
create index appointments_start_idx on public.appointments(salon_id, start_at);

-- LEADS
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  whatsapp text,
  city text,
  plan text,
  source text,
  status text not null default 'novo',
  notes text,
  created_at timestamptz not null default now()
);
create index leads_salon_idx on public.leads(salon_id);

-- PROMOTIONS
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  discount_pct numeric(5,2) not null default 0,
  valid_from date,
  valid_to date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index promotions_salon_idx on public.promotions(salon_id);

-- CAMPAIGNS
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  goal_type text,
  start_date date,
  end_date date,
  prizes jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index campaigns_salon_idx on public.campaigns(salon_id);

-- =========================================
-- RLS
-- =========================================
alter table public.salons      enable row level security;
alter table public.employees   enable row level security;
alter table public.clients     enable row level security;
alter table public.services    enable row level security;
alter table public.appointments enable row level security;
alter table public.leads       enable row level security;
alter table public.promotions  enable row level security;
alter table public.campaigns   enable row level security;

-- SALONS: dono acessa o próprio salão
create policy "salons_select_own" on public.salons for select to authenticated using (owner_id = auth.uid());
create policy "salons_insert_own" on public.salons for insert to authenticated with check (owner_id = auth.uid());
create policy "salons_update_own" on public.salons for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "salons_delete_own" on public.salons for delete to authenticated using (owner_id = auth.uid());

-- Helper para gerar policies idênticas em tabelas com salon_id
-- Fazemos manualmente (sem dynamic SQL) para clareza:

-- EMPLOYEES
create policy "employees_all_own" on public.employees for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- CLIENTS
create policy "clients_all_own" on public.clients for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- SERVICES
create policy "services_all_own" on public.services for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- APPOINTMENTS
create policy "appointments_all_own" on public.appointments for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- LEADS
create policy "leads_all_own" on public.leads for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- PROMOTIONS
create policy "promotions_all_own" on public.promotions for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- CAMPAIGNS
create policy "campaigns_all_own" on public.campaigns for all to authenticated
  using (public.is_salon_owner(salon_id)) with check (public.is_salon_owner(salon_id));

-- =========================================
-- Trigger: cria salão padrão ao registrar usuário
-- =========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.salons (owner_id, name, owner_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'salon_name', 'Meu Salão'),
    coalesce(new.raw_user_meta_data->>'owner_name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();