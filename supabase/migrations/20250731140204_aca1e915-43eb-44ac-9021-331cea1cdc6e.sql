-- Create function to trigger Google Sheets sync
CREATE OR REPLACE FUNCTION public.trigger_google_sheets_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to sync data to Google Sheets
  PERFORM net.http_post(
    url := 'https://jofuqlexuxzamltxxzuq.supabase.co/functions/v1/sync-to-google-sheets',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvZnVxbGV4dXh6YW1sdHh4enVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMDA2NjAsImV4cCI6MjA2NDY3NjY2MH0.Fq_Sx7NUeZF2k-erwrj_V-2npReXum9Cmuufsco3Cmw"}'::jsonb,
    body := json_build_object('record', row_to_json(NEW))::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on consent_forms table
CREATE TRIGGER consent_forms_google_sheets_sync
  AFTER INSERT ON public.consent_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_google_sheets_sync();