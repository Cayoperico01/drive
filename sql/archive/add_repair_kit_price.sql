ALTER TABLE public.inventory_settings 
ADD COLUMN IF NOT EXISTS repair_kit_price NUMERIC DEFAULT 2500;
