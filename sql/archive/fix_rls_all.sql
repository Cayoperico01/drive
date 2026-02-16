ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.employees;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.sales;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.time_entries;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.weekly_archives;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.payroll_settings;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.webhook_settings;

CREATE POLICY "Enable all access for all users" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.time_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.weekly_archives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.payroll_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.webhook_settings FOR ALL USING (true) WITH CHECK (true);

