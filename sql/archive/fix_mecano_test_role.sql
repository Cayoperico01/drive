-- FIX: Erreur "violates check constraint employees_role_valid"
-- Copiez et exécutez ce code dans l'éditeur SQL de Supabase

-- 1. Supprimer l'ancienne restriction (on essaie les noms possibles)
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_role_valid;

-- 2. Créer la nouvelle restriction incluant 'mecano_test'
ALTER TABLE public.employees ADD CONSTRAINT employees_role_check 
CHECK (role IN ('mecano_confirme', 'mecano_junior', 'mecano_test', 'chef_atelier', 'patron', 'co_patron', 'responsable_rh', 'chef_formatrice', 'formateur'));

-- 3. Mettre à jour la config des primes (optionnel mais recommandé)
UPDATE public.payroll_settings 
SET role_primes = jsonb_set(role_primes, '{mecano_test}', '5') 
WHERE id = 1;
