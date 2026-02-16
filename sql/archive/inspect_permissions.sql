    SELECT 
        conname AS constraint_name, 
        contype AS constraint_type, 
        pg_get_constraintdef(c.oid)
    FROM pg_constraint c 
    JOIN pg_namespace n ON n.oid = c.connamespace 
    WHERE conrelid = 'employee_permissions'::regclass;

    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'employee_permissions';
