-- ===========================================================================
-- Helper functions
-- ===========================================================================

-- GST invoice numbers must be sequential and must not repeat, even if two
-- payments are confirmed at the same instant. A sequence gives that guarantee
-- where a "max(invoice_number) + 1" query would not.
--
-- security definer so it can be called with the service role from the payment
-- webhook without granting sequence rights more broadly.
create or replace function next_invoice_number()
returns bigint
language sql
security definer
set search_path = public
as $fn$
  select nextval('invoice_number_seq');
$fn$;

revoke execute on function next_invoice_number() from anon, authenticated;
