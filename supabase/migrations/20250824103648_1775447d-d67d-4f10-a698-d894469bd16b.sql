
-- Purpose: Lock down SELECT access to sensitive patient data in consent_forms,
-- while preserving anonymous INSERT for public submissions. This script:
-- 1) Ensures RLS is enabled
-- 2) Drops any existing SELECT policies
-- 3) Creates/ensures a public INSERT policy
-- 4) Creates an explicit SELECT policy restricted to service_role only
-- Re-runnable and logs actions via RAISE NOTICE.

-- 1) Ensure RLS is enabled
ALTER TABLE public.consent_forms ENABLE ROW LEVEL SECURITY;

-- 2) Drop any existing SELECT policies (avoid overlap/conflicts)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT polname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consent_forms'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.consent_forms;', pol.polname);
    RAISE NOTICE 'Dropped SELECT policy on consent_forms: %', pol.polname;
  END LOOP;
END
$$;

-- 3) Ensure a public INSERT policy exists (anyone can submit a form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consent_forms'
      AND cmd = 'INSERT'
      AND polname = 'public_insert_only_consent_forms'
  ) THEN
    CREATE POLICY public_insert_only_consent_forms
      ON public.consent_forms
      FOR INSERT
      TO public
      WITH CHECK (true);
    RAISE NOTICE 'Created INSERT policy public_insert_only_consent_forms on consent_forms.';
  ELSE
    RAISE NOTICE 'INSERT policy public_insert_only_consent_forms already exists on consent_forms; leaving as-is.';
  END IF;
END
$$;

-- 4) Create an explicit SELECT policy restricted to service_role only
-- Note: service_role bypasses RLS by design in Supabase; this policy makes intent explicit.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'consent_forms'
      AND cmd = 'SELECT'
      AND polname = 'service_role_select_consent_forms'
  ) THEN
    CREATE POLICY service_role_select_consent_forms
      ON public.consent_forms
      FOR SELECT
      TO public
      USING (auth.role() = 'service_role');
    RAISE NOTICE 'Created SELECT policy service_role_select_consent_forms (service_role-only) on consent_forms.';
  ELSE
    RAISE NOTICE 'SELECT policy service_role_select_consent_forms already exists on consent_forms; leaving as-is.';
  END IF;
END
$$;

-- Documentation for future owners
COMMENT ON TABLE public.consent_forms IS
  'Contains sensitive consent forms. RLS enabled. Public INSERT allowed for anonymous submissions; SELECT restricted to service_role only.';
