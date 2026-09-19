-- MERX customer authentication upgrade
-- Passwords are stored only as scrypt hashes + per-user salts.
-- The table is intentionally not readable/writable from the public client.

create table if not exists customer_accounts (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customer_accounts enable row level security;

-- No anon/authenticated policies are created on purpose.
-- Server routes use SUPABASE_SERVICE_ROLE_KEY and therefore bypass RLS.

drop policy if exists "public read customer accounts" on customer_accounts;
drop policy if exists "public insert customer accounts" on customer_accounts;
drop policy if exists "public update customer accounts" on customer_accounts;

create index if not exists customer_accounts_email_lower_idx on customer_accounts (lower(email));
