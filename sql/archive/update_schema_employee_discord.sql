ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS discord_id TEXT;
NOTIFY pgrst, 'reload schema';

