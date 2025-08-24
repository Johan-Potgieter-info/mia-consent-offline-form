
-- Secure Supabase tables for mia-consent-offline-form: remove public read access, allow INSERT-only

-- Enable RLS on tables (safe if already enabled)
ALTER TABLE IF EXISTS public.consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_queue ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on consent_forms
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT pol.policyname
    FROM pg_policies pol
    WHERE pol.schemaname = 'public' AND pol.tablename = 'consent_forms'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.consent_forms', r.policyname);
    RAISE NOTICE 'Dropped policy % on consent_forms', r.policyname;
  END LOOP;
END $$;

-- Drop all existing policies on form_drafts
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT pol.policyname
    FROM pg_policies pol
    WHERE pol.schemaname = 'public' AND pol.tablename = 'form_drafts'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.form_drafts', r.policyname);
    RAISE NOTICE 'Dropped policy % on form_drafts', r.policyname;
  END LOOP;
END $$;

-- Drop all existing policies on sync_queue
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT pol.policyname
    FROM pg_policies pol
    WHERE pol.schemaname = 'public' AND pol.tablename = 'sync_queue'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sync_queue', r.policyname);
    RAISE NOTICE 'Dropped policy % on sync_queue', r.policyname;
  END LOOP;
END $$;

-- Create INSERT-only policies for public access
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'consent_forms') THEN
    CREATE POLICY "public_insert_only_consent_forms" ON public.consent_forms FOR INSERT WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_drafts') THEN
    CREATE POLICY "public_insert_only_form_drafts" ON public.form_drafts FOR INSERT WITH CHECK (true);
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sync_queue') THEN
    CREATE POLICY "public_insert_only_sync_queue" ON public.sync_queue FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Reconfirm RLS is enabled
ALTER TABLE IF EXISTS public.consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.form_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sync_queue ENABLE ROW LEVEL SECURITY;
