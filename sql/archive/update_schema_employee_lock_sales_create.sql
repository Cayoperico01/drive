-- Verrouillage employé (arrêt maladie, etc.) via permissions
-- Objectif: pouvoir mettre permissions.sales.create = false dans employee_permissions
-- À exécuter dans l'éditeur SQL de Supabase

-- 1) Table employee_permissions (si absente)
CREATE TABLE IF NOT EXISTS public.employee_permissions (
    employee_id TEXT PRIMARY KEY REFERENCES public.employees(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2) RLS (MVP permissif comme le reste du projet)
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.employee_permissions;
CREATE POLICY "Enable all access for all users" ON public.employee_permissions FOR ALL USING (true) WITH CHECK (true);

-- 3) (Optionnel) Index utile
CREATE INDEX IF NOT EXISTS employee_permissions_employee_id_idx ON public.employee_permissions(employee_id);

-- 4) Rafraîchir le schéma PostgREST/Supabase
NOTIFY pgrst, 'reload schema';

