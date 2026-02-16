
-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id text PRIMARY KEY,
    title text,
    fournisseur text,
    partenaire text,
    date date,
    content_json jsonb,
    created_at timestamptz DEFAULT now(),
    created_by text
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON public.contracts
    FOR SELECT USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.contracts
    FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.contracts
    FOR UPDATE USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.contracts
    FOR DELETE USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Grant access
GRANT ALL ON public.contracts TO anon;
GRANT ALL ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
