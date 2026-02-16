-- Correctif pour ajouter la colonne position si elle manque
-- À exécuter dans l'éditeur SQL de Supabase

ALTER TABLE public.training_courses 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Recharger le cache de schéma pour que l'API voie la nouvelle colonne
NOTIFY pgrst, 'reload schema';
