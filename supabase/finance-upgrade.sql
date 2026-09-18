-- MERX Finance / Wallet upgrade.
-- Run once in Supabase SQL Editor. Safe to run repeatedly.

create table if not exists store_wallets (
  id integer primary key,
  balance bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint store_wallets_singleton check (id = 1)
);
insert into store_wallets(id, balance) values (1, 0) on conflict (id) do nothing;

create table if not exists wallet_transactions (
  id bigserial primary key,
  wallet_id integer not null default 1 references store_wallets(id) on delete cascade,
  direction text not null check (direction in ('credit','debit')),
  transaction_type text not null check (transaction_type in ('sale','withdrawal','refund','adjustment')),
  amount bigint not null check (amount > 0),
  reference_key text not null unique,
  reference_type text,
  reference_id text,
  method text,
  destination text,
  note text,
  created_at timestamptz not null default now()
);

alter table store_wallets enable row level security;
alter table wallet_transactions enable row level security;

-- Credit the internal MERX wallet exactly once for each paid order.
create or replace function public.merx_credit_order_wallet(p_order_id bigint, p_amount bigint)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted bigint;
  v_balance bigint;
begin
  if p_amount <= 0 then
    return (select balance from store_wallets where id = 1);
  end if;

  insert into wallet_transactions(
    wallet_id, direction, transaction_type, amount,
    reference_key, reference_type, reference_id, method, note
  ) values (
    1, 'credit', 'sale', p_amount,
    'order:' || p_order_id::text, 'order', p_order_id::text, 'order_payment', 'Pembayaran pesanan MERX'
  )
  on conflict (reference_key) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update store_wallets
      set balance = balance + p_amount,
          updated_at = now()
      where id = 1;
  end if;

  select balance into v_balance from store_wallets where id = 1;
  return v_balance;
end;
$$;

create or replace function public.merx_order_wallet_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.status = 'paid'
     and NEW.total > 0
     and (TG_OP = 'INSERT' or OLD.status is distinct from 'paid') then
    perform public.merx_credit_order_wallet(NEW.id, NEW.total);
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_merx_order_wallet on orders;
create trigger trg_merx_order_wallet
after insert or update of status, total on orders
for each row execute function public.merx_order_wallet_trigger();

-- Atomic withdrawal: checks balance, records the debit, and returns the new balance.
create or replace function public.merx_withdraw_wallet(
  p_amount bigint,
  p_method text,
  p_destination text,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
  v_tx_id bigint;
  v_reference text;
begin
  if p_amount <= 0 then
    raise exception 'Jumlah penarikan harus lebih dari 0';
  end if;

  select balance into v_balance
  from store_wallets
  where id = 1
  for update;

  if coalesce(v_balance, 0) < p_amount then
    raise exception 'Saldo tidak mencukupi. Saldo tersedia Rp %', coalesce(v_balance, 0);
  end if;

  update store_wallets
    set balance = balance - p_amount,
        updated_at = now()
    where id = 1;

  v_reference := 'withdrawal:' || extract(epoch from clock_timestamp())::bigint || ':' || p_amount;

  insert into wallet_transactions(
    wallet_id, direction, transaction_type, amount,
    reference_key, reference_type, reference_id,
    method, destination, note
  ) values (
    1, 'debit', 'withdrawal', p_amount,
    v_reference, 'withdrawal', v_reference,
    nullif(trim(p_method), ''), nullif(trim(p_destination), ''), nullif(trim(p_note), '')
  ) returning id into v_tx_id;

  select balance into v_balance from store_wallets where id = 1;

  return jsonb_build_object(
    'ok', true,
    'transactionId', v_tx_id,
    'amount', p_amount,
    'balance', v_balance
  );
end;
$$;

grant execute on function public.merx_credit_order_wallet(bigint, bigint) to service_role;
grant execute on function public.merx_withdraw_wallet(bigint, text, text, text) to service_role;

-- Backfill all existing paid orders once, without creating duplicate credits.
do $$
declare
  r record;
begin
  for r in
    select id, total
    from orders
    where status = 'paid' and total > 0
    order by id
  loop
    perform public.merx_credit_order_wallet(r.id, r.total);
  end loop;
end $$;
