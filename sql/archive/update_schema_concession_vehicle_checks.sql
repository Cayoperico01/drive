-- Contrat concessionnaire: suivi par plaque (Full Perf / Custom)
-- À exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS public.concession_vehicle_checks (
    id TEXT PRIMARY KEY,
    plate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unknown' CHECK (status IN ('full_perf', 'custom', 'none', 'unknown')),
    note TEXT DEFAULT '',
    verified_by TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS concession_vehicle_checks_plate_idx ON public.concession_vehicle_checks(plate);

ALTER TABLE public.concession_vehicle_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.concession_vehicle_checks;
CREATE POLICY "Enable all access for all users" ON public.concession_vehicle_checks FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

