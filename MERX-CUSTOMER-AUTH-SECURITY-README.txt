MERX Customer Auth Security Upgrade

What changed:
- Customer passwords are no longer stored in localStorage.
- Customer password hashes use Node scrypt with a random per-user salt.
- Login state uses an httpOnly, signed cookie instead of a localStorage session object.
- Customer profile reads/updates happen through server API routes.
- No public Supabase RLS policy is created for customer_accounts.

Required Supabase step:
Run:
supabase/customer-auth-upgrade.sql
in the Supabase SQL Editor.

Environment:
Recommended Vercel variable:
MERX_CUSTOMER_SECRET=<long random secret, 32+ characters>

The server falls back to MERX_ADMIN_SECRET so the upgrade can work without an immediate extra variable, but a separate customer secret is preferred.

Important:
Existing browser-only accounts in the old merx_users localStorage store are not migrated, because their passwords were plaintext client-side. Customers should create accounts again after this upgrade.
