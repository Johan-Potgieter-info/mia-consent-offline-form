-- CRITICAL SECURITY FIX: Remove public access to medical data
-- This fixes exposed patient medical records, draft forms, and sync queue data

-- 1. Drop all existing dangerous public policies for consent_forms
DROP POLICY IF EXISTS "Allow public read access to consent forms" ON public.consent_forms;
DROP POLICY IF EXISTS "Allow public select on consent_forms" ON public.consent_forms;
DROP POLICY IF EXISTS "Allow public insert on consent_forms" ON public.consent_forms;
DROP POLICY IF EXISTS "Allow public update on consent_forms" ON public.consent_forms;

-- 2. Drop all existing dangerous public policies for form_drafts  
DROP POLICY IF EXISTS "Allow public select on form_drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow public insert on form_drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow public update on form_drafts" ON public.form_drafts;
DROP POLICY IF EXISTS "Allow public delete on form_drafts" ON public.form_drafts;

-- 3. Drop all existing dangerous public policies for sync_queue
DROP POLICY IF EXISTS "Allow public select on sync_queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow public insert on sync_queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow public update on sync_queue" ON public.sync_queue;
DROP POLICY IF EXISTS "Allow public delete on sync_queue" ON public.sync_queue;

-- 4. Create secure policies for consent_forms
-- Allow INSERT only for form submission (no authentication required for initial submission)
CREATE POLICY "Allow form submission without auth" 
ON public.consent_forms 
FOR INSERT 
WITH CHECK (true);

-- No SELECT policies = no one can read the data (most secure)
-- In the future, add authenticated user policies when auth is implemented

-- 5. Create secure policies for form_drafts
-- Allow INSERT/UPDATE/DELETE only for form creation workflow
CREATE POLICY "Allow draft creation without auth" 
ON public.form_drafts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow draft updates without auth" 
ON public.form_drafts 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow draft deletion without auth" 
ON public.form_drafts 
FOR DELETE 
USING (true);

-- No SELECT policies = no one can browse/read draft data

-- 6. Create secure policies for sync_queue (system use only)
-- No public policies at all - this should only be accessed by system functions
-- Add system access policies if needed in the future

-- 7. Add a comment explaining the security model
COMMENT ON TABLE public.consent_forms IS 'SECURITY: Write-only table for form submissions. Reading requires authentication.';
COMMENT ON TABLE public.form_drafts IS 'SECURITY: Write-only table for draft management. Reading requires authentication.';
COMMENT ON TABLE public.sync_queue IS 'SECURITY: System-only table. No public access allowed.';