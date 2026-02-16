-- FIX: Problème de mise à jour du coffre (Safe) et du Stock
-- À exécuter dans l'éditeur SQL de Supabase

-- ==========================================
-- PARTIE 1 : COFFRE (PAYROLL SETTINGS)
-- ==========================================

-- 1. S'assurer que la table existe
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id bigint NOT NULL DEFAULT 1,
    safe_balance numeric DEFAULT 0,
    commission_rate numeric DEFAULT 0.20,
    grade_rates jsonb DEFAULT '{}'::jsonb,
    role_primes jsonb DEFAULT '{}'::jsonb,
    company_split numeric DEFAULT 0.40,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payroll_settings_pkey PRIMARY KEY (id)
);

-- 2. S'assurer que la ligne existe
INSERT INTO public.payroll_settings (id, safe_balance)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. Fonction RPC pour le coffre (Secure Atomic Increment)
CREATE OR REPLACE FUNCTION increment_safe_balance(amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_val numeric;
BEGIN
  UPDATE public.payroll_settings
  SET safe_balance = COALESCE(safe_balance, 0) + amount
  WHERE id = 1
  RETURNING safe_balance INTO new_val;
  return new_val;
END;
$$;

-- 4. Droits Coffre
GRANT EXECUTE ON FUNCTION increment_safe_balance(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_safe_balance(numeric) TO anon;
GRANT EXECUTE ON FUNCTION increment_safe_balance(numeric) TO service_role;

-- 5. Policies Coffre
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique des settings" ON public.payroll_settings;
CREATE POLICY "Lecture publique des settings" ON public.payroll_settings FOR SELECT USING (true);


-- ==========================================
-- PARTIE 2 : STOCK (INVENTORY SETTINGS)
-- ==========================================

-- 1. S'assurer que la table existe
CREATE TABLE IF NOT EXISTS public.inventory_settings (
    id bigint NOT NULL DEFAULT 1,
    repair_kit_stock integer DEFAULT 0,
    repair_kit_price numeric DEFAULT 2500,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_settings_pkey PRIMARY KEY (id)
);

-- 2. S'assurer que la ligne existe
INSERT INTO public.inventory_settings (id, repair_kit_stock, repair_kit_price)
VALUES (1, 50, 2500)
ON CONFLICT (id) DO NOTHING;

-- 3. Fonction RPC pour le stock (Secure Atomic Update)
-- Permet de définir le nouveau stock (absolu) ou décrémenter.
-- Ici on fait une fonction simple pour mettre à jour le stock
CREATE OR REPLACE FUNCTION update_repair_kit_stock(new_stock integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  res integer;
BEGIN
  UPDATE public.inventory_settings
  SET repair_kit_stock = new_stock
  WHERE id = 1
  RETURNING repair_kit_stock INTO res;
  return res;
END;
$$;

-- 4. Droits Stock
GRANT EXECUTE ON FUNCTION update_repair_kit_stock(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_repair_kit_stock(integer) TO anon;
GRANT EXECUTE ON FUNCTION update_repair_kit_stock(integer) TO service_role;

-- 5. Policies Stock
ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture publique inventory" ON public.inventory_settings;
CREATE POLICY "Lecture publique inventory" ON public.inventory_settings FOR SELECT USING (true);
