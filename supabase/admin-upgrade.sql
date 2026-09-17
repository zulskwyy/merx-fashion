-- MERX Admin Studio upgrade: run once in Supabase SQL Editor.
-- Safe to run repeatedly.

alter table if exists products
  add column if not exists pricing jsonb not null default '{"mode":"manual","target":0}'::jsonb;

alter table if exists orders
  add column if not exists shipping jsonb not null default '{}'::jsonb;

alter table if exists orders
  add column if not exists other_cost bigint not null default 0;

alter table if exists orders
  add column if not exists updated_at timestamptz not null default now();

alter table if exists store_settings
  add column if not exists business jsonb not null default '{}'::jsonb;

update products set pricing = '{"mode":"manual","target":0}'::jsonb where pricing is null;
update orders set shipping = '{}'::jsonb where shipping is null;
update store_settings set business = '{}'::jsonb where business is null;

-- Storage bucket `product-images` is created automatically on first admin image upload.
