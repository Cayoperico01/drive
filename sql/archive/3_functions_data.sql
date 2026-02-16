-- PARTIE 3 : FONCTIONS, TRIGGERS ET DONNÉES
-- Exécutez ce script en dernier

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Gestion des mots de passe
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

-- 2. Fonction d'Authentification
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

-- 3. Fonction Reset Week
CREATE OR REPLACE FUNCTION reset_week()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.sales WHERE id IS NOT NULL;
  DELETE FROM public.time_entries WHERE id IS NOT NULL;
END;
$$;

-- 4. Données Initiales

-- Admin par défaut
INSERT INTO public.employees (id, first_name, last_name, phone, role, username, password)
VALUES 
('admin-1', 'DriveLine', 'Patron', '555-0000', 'patron', 'driveline', 'driveline123')
ON CONFLICT (id) DO NOTHING;

-- Config Paie par défaut
INSERT INTO public.payroll_settings (id, commission_rate, grade_rates, role_primes)
VALUES (1, 0.20, 
    '{"mecano_confirme": 0, "mecano_junior": 0, "chef_atelier": 0, "chef_formatrice": 0, "formateur": 0, "patron": 0, "co_patron": 0, "responsable_rh": 0}'::jsonb,
    '{"mecano_confirme": 20, "mecano_junior": 20, "chef_atelier": 20, "chef_formatrice": 20, "formateur": 20, "patron": 60, "co_patron": 60, "responsable_rh": 20}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.webhook_settings (id, sales_webhook_url, services_webhook_url, services_status_message_id)
VALUES (1, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Force le rafraîchissement du schéma API
NOTIFY pgrst, 'reload schema';
