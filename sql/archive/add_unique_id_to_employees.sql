-- Ajout de la colonne unique_id pour l'ID PMA/Ingame
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS unique_id TEXT;

NOTIFY pgrst, 'reload schema';
