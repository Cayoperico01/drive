-- Ajout de la colonne safe_balance pour la persistance du solde total
ALTER TABLE public.payroll_settings
ADD COLUMN IF NOT EXISTS safe_balance NUMERIC DEFAULT 0;

-- Mise à jour des permissions pour s'assurer que l'écriture est possible
GRANT ALL ON public.payroll_settings TO authenticated;
GRANT ALL ON public.payroll_settings TO service_role;
