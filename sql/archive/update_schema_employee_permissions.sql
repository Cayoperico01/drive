-- Table pour stocker les permissions spécifiques (surcharges) des employés
CREATE TABLE IF NOT EXISTS public.employee_permissions (
    employee_id TEXT PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active la sécurité niveau ligne (RLS)
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- Politique permissive pour permettre à l'application de gérer les droits via l'API
-- (L'application vérifie les rôles 'patron' avant d'écrire, donc on peut laisser ouvert au niveau DB pour simplifier)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.employee_permissions;
CREATE POLICY "Enable all access for all users" ON public.employee_permissions FOR ALL USING (true) WITH CHECK (true);

-- Trigger pour mettre à jour le timestamp updated_at automatiquement
CREATE OR REPLACE FUNCTION update_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_permissions_timestamp ON public.employee_permissions;
CREATE TRIGGER update_permissions_timestamp
    BEFORE UPDATE ON public.employee_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_permissions_updated_at();

-- Notifier Supabase de recharger le schéma
NOTIFY pgrst, 'reload schema';
