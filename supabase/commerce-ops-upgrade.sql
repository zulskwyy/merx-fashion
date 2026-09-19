-- MERX commerce / fulfillment upgrade.
-- Run once in Supabase SQL Editor. Safe to run repeatedly.
-- Keeps checkout totals explicit, removes the need to re-enter shipping in Admin,
-- and adds automatic/manual tax rules without deleting existing data.

alter table store_settings
  add column if not exists commerce_settings jsonb not null default '{"shippingFee":0,"taxRate":11}'::jsonb;

alter table products
  add column if not exists tax jsonb not null default '{"mode":"auto","rate":null}'::jsonb;

alter table orders
  add column if not exists subtotal bigint not null default 0;
alter table orders
  add column if not exists tax_total bigint not null default 0;
alter table orders
  add column if not exists delivery_status text not null default 'pending';
alter table orders
  add column if not exists delivered_at timestamptz;

update store_settings
set commerce_settings = coalesce(commerce_settings, '{"shippingFee":0,"taxRate":11}'::jsonb)
where id = 1;

update products
set tax = '{"mode":"auto","rate":null}'::jsonb
where tax is null;

update orders
set subtotal = case
  when coalesce(subtotal,0) > 0 then subtotal
  else greatest(0, coalesce(total,0) - coalesce(tax_total,0) - coalesce((shipping->>'shippingFee')::bigint,0))
end,
    tax_total = coalesce(tax_total,0),
    delivery_status = case
      when status = 'delivered' then 'delivered'
      when delivery_status in ('pending','delivered') then delivery_status
      else 'pending'
    end
where true;

-- Public/admin APIs use service_role in this project, so no new public write policy is required.
