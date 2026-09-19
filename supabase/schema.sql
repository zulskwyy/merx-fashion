create table if not exists store_settings (
  id integer primary key,
  store_name text not null default 'MERX',
  primary_color text not null default '#1B2A4A',
  accent_color text not null default '#F3EFE7',
  hero_title text not null default 'Gaya yang tetap relevan, dibuat untuk dikenakan lama',
  hero_description text not null default 'Koleksi terpilih untuk kamu yang mengutamakan kualitas, kenyamanan, dan gaya yang tidak berlebihan.',
  hero_image_url text not null default '/images/header-homepage.png',
  business jsonb not null default '{}'::jsonb,
  commerce_settings jsonb not null default '{"shippingFee":0,"taxRate":11}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into store_settings(id) values (1) on conflict (id) do nothing;

create table if not exists products (
  id bigint primary key,
  title text not null,
  slug text not null unique,
  src_url text not null,
  gallery jsonb not null default '[]'::jsonb,
  price bigint not null default 0,
  tax jsonb not null default '{"mode":"auto","rate":null}'::jsonb,
  discount jsonb not null default '{"amount":0,"percentage":0,"source":"manual"}'::jsonb,
  pricing jsonb not null default '{"mode":"manual","target":0}'::jsonb,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  category text not null default 'Other',
  gender text not null default 'Unisex',
  color text not null default 'Default',
  sizes jsonb not null default '[]'::jsonb,
  description text not null default '',
  details jsonb not null default '{}'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  reviews jsonb not null default '[]'::jsonb,
  source_page text not null default '',
  source_id text not null default '',
  source_description text not null default '',
  stock integer not null default 0,
  cost_price bigint not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id bigserial primary key,
  order_code text not null unique,
  customer_name text not null,
  customer_email text not null,
  phone text,
  address text,
  payment_method text not null,
  status text not null default 'paid',
  subtotal bigint not null default 0,
  tax_total bigint not null default 0,
  total bigint not null default 0,
  cost_total bigint not null default 0,
  shipping jsonb not null default '{}'::jsonb,
  delivery_status text not null default 'pending',
  delivered_at timestamptz,
  other_cost bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
 );
create table if not exists order_items (
  id bigserial primary key,
  order_id bigint references orders(id) on delete cascade,
  product_id bigint not null,
  title text not null,
  quantity integer not null default 1,
  unit_price bigint not null default 0,
  cost_price bigint not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists wishlist_events (
  id bigserial primary key,
  product_id bigint not null,
  user_key text not null default 'anonymous',
  event_type text not null default 'save',
  created_at timestamptz not null default now()
);
create table if not exists discount_rules (
  id integer primary key,
  name text not null,
  enabled boolean not null default false,
  stock_threshold integer not null default 5,
  percentage integer not null default 10,
  updated_at timestamptz not null default now()
);
insert into discount_rules(id,name) values (1,'Stok menipis') on conflict(id) do nothing;

-- MERX commerce upgrades: keep checkout totals and delivery state explicit.
alter table products add column if not exists tax jsonb not null default '{"mode":"auto","rate":null}'::jsonb;
alter table orders add column if not exists subtotal bigint not null default 0;
alter table orders add column if not exists tax_total bigint not null default 0;
alter table orders add column if not exists delivery_status text not null default 'pending';
alter table orders add column if not exists delivered_at timestamptz;

update products set tax='{"mode":"auto","rate":null}'::jsonb where tax is null;
update orders set subtotal=coalesce(nullif(subtotal,0), total), tax_total=coalesce(tax_total,0), delivery_status=coalesce(nullif(delivery_status,''),'pending');

-- Idempotent upgrades for existing installations.
alter table products add column if not exists pricing jsonb not null default '{"mode":"manual","target":0}'::jsonb;
alter table orders add column if not exists shipping jsonb not null default '{}'::jsonb;
alter table orders add column if not exists other_cost bigint not null default 0;
alter table orders add column if not exists updated_at timestamptz not null default now();
alter table store_settings add column if not exists business jsonb not null default '{}'::jsonb;
alter table store_settings add column if not exists commerce_settings jsonb not null default '{"shippingFee":0,"taxRate":11}'::jsonb;
update store_settings set commerce_settings='{"shippingFee":0,"taxRate":11}'::jsonb where commerce_settings is null;

update products set pricing='{"mode":"manual","target":0}'::jsonb where pricing is null;
update orders set shipping='{}'::jsonb where shipping is null;
update store_settings set business='{}'::jsonb where business is null;

alter table products enable row level security;
alter table store_settings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlist_events enable row level security;
alter table discount_rules enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (is_active = true);
drop policy if exists "public read store settings" on store_settings;
create policy "public read store settings" on store_settings for select using (true);
