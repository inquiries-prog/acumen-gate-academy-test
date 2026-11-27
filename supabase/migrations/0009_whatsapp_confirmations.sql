-- ===========================================================================
-- 0009 - WhatsApp confirmation outcome on every lead and enrollment
--
-- When a student submits a form (or pays), the site sends them a WhatsApp
-- template through the Meta Cloud API. These columns record what happened, so
-- the admin lists show who got a confirmation and why one failed:
--   confirmation_status      "Sent", "Failed - <reason>" or "Not sent (no provider)"
--   confirmation_message_id  Meta's message id (wamid...), to match against the
--                            Apps Script Delivery Log if a delivery later fails
--   confirmation_error       Meta's full error text, when it failed
--   confirmation_sent_at     when Meta accepted it
--
-- "Sent" means Meta accepted the message. Delivery receipts go to the
-- academy's Apps Script webhook, not to this site.
-- Safe to run more than once.
-- ===========================================================================

alter table general_enquiries  add column if not exists confirmation_status     text not null default '';
alter table general_enquiries  add column if not exists confirmation_message_id text not null default '';
alter table general_enquiries  add column if not exists confirmation_error      text not null default '';
alter table general_enquiries  add column if not exists confirmation_sent_at    timestamptz;

alter table seminar_leads      add column if not exists confirmation_status     text not null default '';
alter table seminar_leads      add column if not exists confirmation_message_id text not null default '';
alter table seminar_leads      add column if not exists confirmation_error      text not null default '';
alter table seminar_leads      add column if not exists confirmation_sent_at    timestamptz;

alter table demo_registrations add column if not exists confirmation_status     text not null default '';
alter table demo_registrations add column if not exists confirmation_message_id text not null default '';
alter table demo_registrations add column if not exists confirmation_error      text not null default '';
alter table demo_registrations add column if not exists confirmation_sent_at    timestamptz;

alter table enrollments        add column if not exists confirmation_status     text not null default '';
alter table enrollments        add column if not exists confirmation_message_id text not null default '';
alter table enrollments        add column if not exists confirmation_error      text not null default '';
alter table enrollments        add column if not exists confirmation_sent_at    timestamptz;
