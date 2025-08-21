
-- Tighten Row Level Security (RLS) to protect sensitive data while preserving anonymous submissions

-- CONSENT_FORMS: write-only (INSERT) for the public, no SELECT/UPDATE/DELETE
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow form submission without auth" ON public.consent_forms;
DROP POLICY IF EXISTS "Allow insert of new consent forms" ON public.consent_forms;
DROP POLICY IF EXISTS "Allow update of own consent forms" ON public.consent_forms;

CREATE POLICY "Public can insert consent forms"
  ON public.consent_forms
  FOR INSERT
  WITH CHECK (true);

-- FORM_DRAFTS: remove public READ access and duplicates; keep write-only INSERT (optional)
ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to form drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow insert of new form drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow draft creation without auth" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow draft updates without auth" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow update of form drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow delete of form drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow draft deletion without auth" ON public.form_drafts;

CREATE POLICY "Public can insert form drafts"
  ON public.form_drafts
  FOR INSERT
  WITH CHECK (true);

-- SYNC_QUEUE: remove public READ/UPDATE/DELETE; keep write-only INSERT (optional)
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to sync queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow insert to sync queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow update of sync queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow delete from sync queue" ON public.sync_queue;

CREATE POLICY "Public can insert sync queue"
  ON public.sync_queue
  FOR INSERT
  WITH CHECK (true);

-- Note:
-- - SELECT policies are intentionally omitted to prevent public reading of PHI.
-- - UPDATE/DELETE policies are intentionally omitted to prevent tampering.
-- - If you later need internal/admin access, we can add role-restricted policies without affecting public submissions.
