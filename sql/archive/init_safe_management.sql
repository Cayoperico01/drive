-- Script d'initialisation pour le module "Gestion Coffre"
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. S'assurer que la table existe (déjà fait normalement)
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    commission_rate NUMERIC NOT NULL DEFAULT 0.20,
    grade_rates JSONB NOT NULL DEFAULT '{}'::jsonb,
    role_primes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Initialiser la configuration du coffre (safe_config) dans la colonne role_primes
-- Cela ne touche pas aux primes existantes, ça ajoute juste la config du coffre
UPDATE public.payroll_settings
SET role_primes = role_primes || '{
  "safe_config": {
    "tax_rate": 0,
    "last_taken": null,
    "last_turnover": 0,
    "manual_balance": 0,
    "manual_balance_updated_at": null
  }
}'::jsonb
WHERE id = 1;
