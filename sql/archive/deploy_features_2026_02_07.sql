-- ==============================================================================
-- SCRIPT DE DÉPLOIEMENT - FONCTIONNALITÉS GESTION COFFRE & PAIEMENTS
-- Date: 07/02/2026
-- ==============================================================================

-- 1. TABLE DES PAIEMENTS (HISTORIQUE)
-- Nécessaire pour le suivi des salaires payés via la case à cocher
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour accélérer l'affichage dans les fiches de paie
CREATE INDEX IF NOT EXISTS idx_payouts_employee_created ON public.payouts(employee_id, created_at);

-- Permissions (RLS) pour que tout le monde puisse voir/écrire (selon logique app)
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.payouts;
CREATE POLICY "Enable all access for all users" ON public.payouts FOR ALL USING (true) WITH CHECK (true);


-- 2. CONFIGURATION DU PRIX DES KITS DE RÉPARATION
-- Ajoute la colonne prix si elle n'existe pas
ALTER TABLE public.inventory_settings 
ADD COLUMN IF NOT EXISTS repair_kit_price NUMERIC DEFAULT 2500;


-- 3. PERSISTANCE DU SOLDE DU COFFRE
-- Ajoute la colonne pour stocker le total théorique (chiffre jaune)
ALTER TABLE public.payroll_settings
ADD COLUMN IF NOT EXISTS safe_balance NUMERIC DEFAULT 0;


-- 4. INITIALISATION DE LA CONFIGURATION COFFRE (INTERVALLE 13H)
-- Met à jour le JSON pour s'assurer que l'intervalle est bien défini à 13h par défaut
UPDATE public.payroll_settings
SET role_primes = 
  CASE 
    -- Si safe_config existe déjà, on fusionne
    WHEN role_primes ? 'safe_config' THEN 
      jsonb_set(
        role_primes, 
        '{safe_config}', 
        (role_primes->'safe_config') || '{"tax_interval": 13}'::jsonb
      )
    -- Sinon, on crée la structure complète
    ELSE 
      role_primes || '{
        "safe_config": {
          "tax_rate": 10,
          "tax_interval": 13,
          "last_taken": null,
          "last_turnover": 0,
          "manual_balance": 0,
          "manual_balance_updated_at": null
        }
      }'::jsonb
  END
WHERE id = 1;

-- 5. PERMISSIONS FINALES
-- S'assurer que les tables sont accessibles
GRANT ALL ON public.payouts TO authenticated;
GRANT ALL ON public.payouts TO service_role;
GRANT ALL ON public.payroll_settings TO authenticated;
GRANT ALL ON public.payroll_settings TO service_role;
GRANT ALL ON public.inventory_settings TO authenticated;
GRANT ALL ON public.inventory_settings TO service_role;
