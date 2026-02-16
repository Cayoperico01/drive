-- Ajout de la colonne last_activity pour le suivi d'inactivité
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW();

NOTIFY pgrst, 'reload schema';
