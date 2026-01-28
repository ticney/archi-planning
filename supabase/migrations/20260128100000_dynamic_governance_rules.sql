-- Create Proof Types Reference Table
create table if not exists governance_proof_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Create Topics Reference Table
create table if not exists governance_topics (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Create Join Table for Dynamic Rules
create table if not exists governance_topic_proofs (
  topic_id uuid references governance_topics(id) on delete cascade,
  proof_type_id uuid references governance_proof_types(id) on delete cascade,
  is_active boolean default true,
  created_at timestamptz default now(),
  primary key (topic_id, proof_type_id)
);

-- Add Snapshot Column to Requests (if not exists)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'governance_requests' and column_name = 'requirements_snapshot') then
        alter table governance_requests
        add column requirements_snapshot jsonb;
    end if;
end $$;

-- Enable RLS
alter table governance_proof_types enable row level security;
alter table governance_topics enable row level security;
alter table governance_topic_proofs enable row level security;

-- Policies (Public Read, Admin Write)
create policy "Allow read access for authenticated users on proof_types"
  on governance_proof_types for select
  to authenticated
  using (true);

create policy "Allow read access for authenticated users on topics"
  on governance_topics for select
  to authenticated
  using (true);

create policy "Allow read access for authenticated users on topic_proofs"
  on governance_topic_proofs for select
  to authenticated
  using (true);

-- Admin Write Policies (assuming explicit admin role or open for now to match other patterns - user role 'admin' check is improved in app layer, but RLS should ideally enforce it. Keeping it open for authenticated for now to match dev velocity, or strictly admin if 'use_role' exists.)
-- For this project context, strict RBAC is in Service Layer, but let's add basic AuthZ if possible.
-- Checking previous migrations for pattern... `reviewer_rls` suggests robust RLS.
-- Let's stick to safe defaults: Read All (Auth), Write (Service Role / Admin specific).
-- Since we don't have a reliable 'is_admin()' function widely used in migrations yet (checked dir list), I'll restrict write to service_role or specific admin check if valid.
-- Simplest: Authenticated Read. Write only by Service Role or explicit Admin if we had the claim.
-- For now, allow all authenticated to read (needed for UI). 
-- Writes are done by Admin Actions which use Service Role or checked user.


-- SEED DATA
-- Insert Proof Types
insert into governance_proof_types (slug, name, description) values
  ('dat_sheet', 'DAT Sheet', 'Data Access & Trust Sheet'),
  ('architecture_diagram', 'Architecture Diagram', 'High-level system architecture'),
  ('security_signoff', 'Security Sign-off', 'Infosec approval'),
  ('finops_approval', 'FinOps Approval', 'Budget and cost approval'),
  ('other', 'Other Document', 'Miscellaneous documentation')
on conflict (slug) do nothing;

-- Insert Topics
insert into governance_topics (slug, name) values
  ('standard', 'Standard Review'),
  ('strategic', 'Strategic Initiative')
on conflict (slug) do nothing;

-- Link Topics to Proofs (Seed Rules)
do $$
declare
  t_standard uuid;
  t_strategic uuid;
  p_dat uuid;
  p_arch uuid;
  p_sec uuid;
  p_fin uuid;
begin
  select id into t_standard from governance_topics where slug = 'standard';
  select id into t_strategic from governance_topics where slug = 'strategic';
  
  select id into p_dat from governance_proof_types where slug = 'dat_sheet';
  select id into p_arch from governance_proof_types where slug = 'architecture_diagram';
  select id into p_sec from governance_proof_types where slug = 'security_signoff';
  select id into p_fin from governance_proof_types where slug = 'finops_approval';

  -- Standard: DAT + Arch
  if t_standard is not null then
    insert into governance_topic_proofs (topic_id, proof_type_id) values (t_standard, p_dat) on conflict do nothing;
    insert into governance_topic_proofs (topic_id, proof_type_id) values (t_standard, p_arch) on conflict do nothing;
  end if;

  -- Strategic: DAT + Sec + Fin
  if t_strategic is not null then
    insert into governance_topic_proofs (topic_id, proof_type_id) values (t_strategic, p_dat) on conflict do nothing;
    insert into governance_topic_proofs (topic_id, proof_type_id) values (t_strategic, p_sec) on conflict do nothing;
    insert into governance_topic_proofs (topic_id, proof_type_id) values (t_strategic, p_fin) on conflict do nothing;
  end if;
end $$;
