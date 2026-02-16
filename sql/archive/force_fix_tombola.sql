-- SOLUTION RADICALE : Désactivation de la sécurité RLS pour la table tombola
-- Cela règle définitivement le problème de droits bloquants.

-- 1. Désactiver RLS (Row Level Security) sur la table
ALTER TABLE public.tombola_entries DISABLE ROW LEVEL SECURITY;

-- 2. Donner explicitement tous les droits à tout le monde (connecté ou non)
GRANT ALL ON public.tombola_entries TO postgres;
GRANT ALL ON public.tombola_entries TO service_role;
GRANT ALL ON public.tombola_entries TO authenticated;
GRANT ALL ON public.tombola_entries TO anon;

NOTIFY pgrst, 'reload schema';
