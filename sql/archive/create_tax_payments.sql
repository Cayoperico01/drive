-- Create table for storing tax payment history
CREATE TABLE IF NOT EXISTS tax_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC NOT NULL,
    rate NUMERIC NOT NULL,
    taxable_base NUMERIC NOT NULL,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ DEFAULT now(),
    paid_at TIMESTAMPTZ DEFAULT now(),
    paid_by TEXT REFERENCES employees(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE tax_payments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view (transparency)
CREATE POLICY "Enable read access for all users" ON tax_payments
    FOR SELECT USING (true);

-- Only Patron/Co-Patron/Responsable can insert (usually who manages safe)
CREATE POLICY "Enable insert for authorized roles" ON tax_payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM employees
            WHERE employees.id = auth.uid()::text
            AND employees.role IN ('patron', 'co_patron', 'responsable')
        )
    );
