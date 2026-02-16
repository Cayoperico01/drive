-- Table pour l'historique des paiements de salaires
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour la recherche rapide
CREATE INDEX IF NOT EXISTS idx_payouts_employee_created ON public.payouts(employee_id, created_at);

-- Sécurité RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for all users" ON public.payouts;
CREATE POLICY "Enable all access for all users" ON public.payouts FOR ALL USING (true) WITH CHECK (true);
