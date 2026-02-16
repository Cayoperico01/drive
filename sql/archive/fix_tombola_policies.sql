-- Correction des permissions RLS pour la Tombola

-- 1. On supprime les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Tout le monde peut voir la tombola" ON public.tombola_entries;
DROP POLICY IF EXISTS "Tout le monde peut modifier la tombola" ON public.tombola_entries;

-- 2. On s'assure que RLS est activé
ALTER TABLE public.tombola_entries ENABLE ROW LEVEL SECURITY;

-- 3. On crée des politiques explicites et permissives pour les utilisateurs connectés

-- Lecture (SELECT) : Tout le monde peut voir
CREATE POLICY "tombola_select_policy" 
ON public.tombola_entries FOR SELECT 
TO authenticated 
USING (true);

-- Insertion (INSERT) : Tout le monde peut ajouter
CREATE POLICY "tombola_insert_policy" 
ON public.tombola_entries FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Modification (UPDATE) : Tout le monde peut modifier
CREATE POLICY "tombola_update_policy" 
ON public.tombola_entries FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Suppression (DELETE) : Tout le monde peut supprimer
CREATE POLICY "tombola_delete_policy" 
ON public.tombola_entries FOR DELETE 
TO authenticated 
USING (true);

NOTIFY pgrst, 'reload schema';
