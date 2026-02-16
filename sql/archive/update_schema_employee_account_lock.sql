ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS account_lock JSONB;

CREATE OR REPLACE FUNCTION public.is_account_lock_active(p_lock JSONB, p_at TIMESTAMPTZ DEFAULT now())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT
    p_lock IS NOT NULL
    AND jsonb_typeof(p_lock) = 'object'
    AND COALESCE(NULLIF(trim(p_lock->>'reason'), ''), '') <> ''
    AND COALESCE(p_lock->>'start', '') <> ''
    AND COALESCE(p_lock->>'end', '') <> ''
    AND (p_at::date) BETWEEN (p_lock->>'start')::date AND (p_lock->>'end')::date;
$$;

CREATE OR REPLACE FUNCTION public.authenticate_employee(p_username TEXT, p_password TEXT)
RETURNS SETOF public.employees
LANGUAGE plpgsql
AS $$
DECLARE
  e public.employees%ROWTYPE;
BEGIN
  SELECT *
  INTO e
  FROM public.employees
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash);

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF public.is_account_lock_active(e.account_lock, now()) THEN
    RAISE EXCEPTION USING
      MESSAGE = 'ACCOUNT_LOCKED',
      DETAIL = COALESCE(e.account_lock, '{}'::jsonb)::text;
  END IF;

  RETURN NEXT e;
END;
$$;

NOTIFY pgrst, 'reload schema';
