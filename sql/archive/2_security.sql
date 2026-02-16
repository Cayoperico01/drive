-- PARTIE 2 : SÉCURITÉ (RLS)
-- Exécutez ce script après la création des tables

-- Activation RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;

-- Nettoyage des anciennes politiques
DROP POLICY IF EXISTS "Enable all access for all users" ON public.employees;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.sales;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.time_entries;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.weekly_archives;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.payroll_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.webhook_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.training_courses;

-- Création des nouvelles politiques (Mode Permissif pour MVP)
-- Note: Dans le futur, restreindre l'accès en écriture aux admins
CREATE POLICY "Enable all access for all users" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.weekly_archives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.payroll_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.webhook_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.training_courses FOR ALL USING (true) WITH CHECK (true);
