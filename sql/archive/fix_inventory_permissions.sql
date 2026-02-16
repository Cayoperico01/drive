-- Fix permissions for inventory_settings to allow Admin to update stock
-- Since we might not be using Supabase Auth fully, we allow public writes for now 
-- (The application protects the Admin UI via frontend logic)

ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

-- Allow reading (already done, but reinforcing)
DROP POLICY IF EXISTS "Public read inventory" ON public.inventory_settings;
CREATE POLICY "Public read inventory" ON public.inventory_settings FOR SELECT USING (true);

-- Allow updating/inserting (Needed for Admin Config to save stock)
DROP POLICY IF EXISTS "Public update inventory" ON public.inventory_settings;
CREATE POLICY "Public update inventory" ON public.inventory_settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public modify inventory" ON public.inventory_settings;
CREATE POLICY "Public modify inventory" ON public.inventory_settings FOR UPDATE USING (true);
