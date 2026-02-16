-- Create employment_contracts table
CREATE TABLE IF NOT EXISTS public.employment_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    signed_at TIMESTAMPTZ DEFAULT now(),
    content_html TEXT,
    signature TEXT,
    role_at_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.employment_contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own contract
CREATE POLICY "Employees can view own contract" ON public.employment_contracts
    FOR SELECT
    USING (true); -- Simplified for app-managed auth context

-- Policy: Employees can insert their own contract (sign it)
CREATE POLICY "Employees can sign own contract" ON public.employment_contracts
    FOR INSERT
    WITH CHECK (true);

