MERX Public Demo Sandbox

This upgrade adds a public Demo Admin entry point without exposing the production admin credential. Each demo launch creates a unique workspace with isolated products, orders, wallet, settings, discounts, and wishlist events. Demo workspaces expire after 24 hours and are cleaned up opportunistically.

Demo mode stays on server-side sandbox tables. Production tables are not selected by demo Admin APIs. Uploads created in demo mode are stored under a demo workspace path in the same public product-images bucket.

Run supabase/demo-sandbox-upgrade.sql once in Supabase SQL Editor before deploying. Production tables are not altered by the demo migration.
