
-- Purpose: Codify existing behavior by explicitly denying public SELECT access
-- to sensitive tables that contain patient data. This does not change
-- effective access (no SELECT policies existed), but makes intent clear for
-- future maintainers and audits.

-- Safety: Ensure RLS is enabled (idempotent)
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Explicit no-read policies for public (anon/authenticated).
-- Note: RLS policies are allow-lists; USING (false) does not override other
-- policies, it simply never grants access. The service role bypasses RLS.

-- consent_forms
CREATE POLICY "No public read of consent_forms"
  ON public.consent_forms
  FOR SELECT
  TO public
  USING (false);

-- form_drafts
CREATE POLICY "No public read of form_drafts"
  ON public.form_drafts
  FOR SELECT
  TO public
  USING (false);

-- sync_queue
CREATE POLICY "No public read of sync_queue"
  ON public.sync_queue
  FOR SELECT
  TO public
  USING (false);

-- Optional: quick verification query (returns currently defined policies)
-- You can re-run this in the SQL editor after migration:
-- SELECT schemaname, tablename, policyname, cmd, roles
-- FROM pg_policies
-- WHERE tablename IN ('consent_forms','form_drafts','sync_queue')
-- ORDER BY tablename, cmd;
