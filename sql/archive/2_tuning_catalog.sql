-- Table pour le Catalogue Custom (Calculateur)
CREATE TABLE IF NOT EXISTS public.tuning_catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    cost NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activation RLS (Row Level Security)
ALTER TABLE public.tuning_catalog ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire (pour afficher le catalogue)
CREATE POLICY "Enable read access for all users" ON public.tuning_catalog
    FOR SELECT USING (true);

-- Politique : Tout le monde peut insérer (pour que le patron puisse ajouter)
CREATE POLICY "Enable insert access for all users" ON public.tuning_catalog
    FOR INSERT WITH CHECK (true);

-- Politique : Tout le monde peut modifier (pour mettre à jour les prix)
CREATE POLICY "Enable update access for all users" ON public.tuning_catalog
    FOR UPDATE USING (true);

-- Politique : Tout le monde peut supprimer
CREATE POLICY "Enable delete access for all users" ON public.tuning_catalog
    FOR DELETE USING (true);

-- Nettoyage des exemples
DELETE FROM public.tuning_catalog WHERE id IN ('def1', 'def2', 'def3', 'def4', 'def5', 'def6');
