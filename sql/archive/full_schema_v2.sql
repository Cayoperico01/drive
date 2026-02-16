-- Script SQL complet et mis à jour pour DriveLine Customs Manager
-- À exécuter dans l'éditeur SQL de Supabase
-- Dernière mise à jour: 2026-01-23

-- 1. Nettoyage (Optionnel : décommenter pour repartir de zéro)
-- DROP TABLE IF EXISTS public.weekly_archives;
-- DROP TABLE IF EXISTS public.time_entries;
-- DROP TABLE IF EXISTS public.sales;
-- DROP TABLE IF EXISTS public.employees;
-- DROP TABLE IF EXISTS public.payroll_settings;
-- DROP TABLE IF EXISTS public.webhook_settings;
-- DROP TABLE IF EXISTS public.training_courses;
-- DROP FUNCTION IF EXISTS reset_week;

-- 2. Table des Employés
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    iban TEXT,
    role TEXT NOT NULL CHECK (role IN ('mecano_confirme', 'mecano_junior', 'chef_atelier', 'patron', 'co_patron', 'responsable_rh', 'chef_formatrice', 'formateur')),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    photo TEXT,
    custom_rate NUMERIC DEFAULT NULL,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Interventions (Factures / Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    vehicle_model TEXT NOT NULL,
    plate TEXT,
    service_type TEXT NOT NULL,
    contract_full_perf BOOLEAN DEFAULT false,
    contract_full_custom BOOLEAN DEFAULT false,
    price NUMERIC NOT NULL,
    invoice_url TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table de Pointage (Pointeuse)
CREATE TABLE IF NOT EXISTS public.time_entries (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    paused BOOLEAN DEFAULT false,
    pause_started TIMESTAMP WITH TIME ZONE,
    pause_total_ms NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table des Archives Hebdomadaires
CREATE TABLE IF NOT EXISTS public.weekly_archives (
    id TEXT PRIMARY KEY,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    total_sales_count INTEGER NOT NULL DEFAULT 0,
    period_label TEXT,
    total_payroll NUMERIC DEFAULT 0,
    payroll_details JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table de Configuration Paie
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Assure une seule ligne de config
    commission_rate NUMERIC NOT NULL DEFAULT 0.20,
    grade_rates JSONB NOT NULL DEFAULT '{"mecano_confirme": 0, "mecano_junior": 0, "chef_atelier": 0, "chef_formatrice": 0, "formateur": 0, "patron": 0, "co_patron": 0, "responsable_rh": 0}'::jsonb,
    role_primes JSONB NOT NULL DEFAULT '{"mecano_confirme": 20, "mecano_junior": 20, "chef_atelier": 20, "chef_formatrice": 20, "formateur": 20, "patron": 60, "co_patron": 60, "responsable_rh": 20}'::jsonb,
    company_split NUMERIC DEFAULT 0.60,
    safe_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table Configuration Webhooks
CREATE TABLE IF NOT EXISTS public.webhook_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    sales_webhook_url TEXT DEFAULT '',
    services_webhook_url TEXT DEFAULT '',
    services_status_message_id TEXT DEFAULT '',
    recruitment_open BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Table des Formations
CREATE TABLE IF NOT EXISTS public.training_courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Sécurité (Row Level Security)
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Politiques Permissives (MVP - Sécurité gérée par l'app pour l'instant)
DROP POLICY IF EXISTS "Enable all access for all users" ON public.employees;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.sales;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.time_entries;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.weekly_archives;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.payroll_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.webhook_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.training_courses;

CREATE POLICY "Enable all access for all users" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.weekly_archives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.payroll_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.webhook_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.training_courses FOR ALL USING (true) WITH CHECK (true);

-- 10. Fonctions et Triggers d'Authentification

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Trigger pour haser les mots de passe
CREATE OR REPLACE FUNCTION public.employees_password_hash_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.password IS NOT NULL THEN
    IF TG_OP = 'INSERT' OR OLD.password IS DISTINCT FROM NEW.password OR NEW.password_hash IS NULL THEN
      NEW.password_hash = crypt(NEW.password, gen_salt('bf'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_employees_password_hash ON public.employees;
CREATE TRIGGER trg_employees_password_hash
BEFORE INSERT OR UPDATE OF password ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.employees_password_hash_trigger();

-- Fonction d'authentification sécurisée
CREATE OR REPLACE FUNCTION public.authenticate_employee(p_username TEXT, p_password TEXT)
RETURNS SETOF public.employees
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM public.employees e
  WHERE e.username = p_username
    AND e.password_hash = crypt(p_password, e.password_hash);
END;
$$;

-- 11. Fonction Reset Week (Clôture Hebdomadaire)
CREATE OR REPLACE FUNCTION reset_week()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supprime toutes les ventes et pointages pour démarrer la nouvelle semaine
  DELETE FROM public.sales WHERE id IS NOT NULL;
  DELETE FROM public.time_entries WHERE id IS NOT NULL;
END;
$$;

-- 12. Données Initiales

-- Admin par défaut
INSERT INTO public.employees (id, first_name, last_name, phone, role, username, password)
VALUES 
('admin-1', 'DriveLine', 'Patron', '555-0000', 'patron', 'driveline', 'driveline123')
ON CONFLICT (id) DO NOTHING;

-- Config par défaut
INSERT INTO public.payroll_settings (id, commission_rate, grade_rates, role_primes)
VALUES (1, 0.20, 
    '{"mecano_confirme": 0, "mecano_junior": 0, "chef_atelier": 0, "chef_formatrice": 0, "formateur": 0, "patron": 0, "co_patron": 0, "responsable_rh": 0}'::jsonb,
    '{"mecano_confirme": 20, "mecano_junior": 20, "chef_atelier": 20, "chef_formatrice": 20, "formateur": 20, "patron": 60, "co_patron": 60, "responsable_rh": 20}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.webhook_settings (id, sales_webhook_url, services_webhook_url, services_status_message_id)
VALUES (1, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Force le reload du schéma pour l'API REST
NOTIFY pgrst, 'reload schema';
