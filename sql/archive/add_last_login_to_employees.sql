
-- Add last_login column to employees table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'last_login') THEN
        ALTER TABLE employees ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
