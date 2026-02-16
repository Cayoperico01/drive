-- Création de la table pour la Tombola
CREATE TABLE IF NOT EXISTS public.tombola_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tickets INTEGER NOT NULL DEFAULT 1 CHECK (tickets > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation de la sécurité (RLS)
ALTER TABLE public.tombola_entries ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
-- Tout le monde peut voir la liste
CREATE POLICY "Tout le monde peut voir la tombola" 
ON public.tombola_entries FOR SELECT 
TO authenticated 
USING (true);

-- Tout le monde (authentifié) peut ajouter/supprimer (la restriction se fait côté interface pour les patrons)
CREATE POLICY "Tout le monde peut modifier la tombola" 
ON public.tombola_entries FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Activer le temps réel pour que tout le monde voie les changements en direct
ALTER PUBLICATION supabase_realtime ADD TABLE public.tombola_entries;

NOTIFY pgrst, 'reload schema';
