-- 1. Nettoyage des doublons (toujours utile pour être sûr)
DELETE FROM employee_permissions
WHERE ctid NOT IN (
    SELECT ctid
    FROM (
        SELECT ctid, ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY updated_at DESC) as rnum
        FROM employee_permissions
    ) t
    WHERE t.rnum = 1
);

-- 2. Essayer d'ajouter une contrainte UNIQUE si la clé primaire existe déjà
-- Cela permet à l'UPSERT de fonctionner (ON CONFLICT employee_id) même si ce n'est pas techniquement la "Primary Key"
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'employee_permissions_employee_id_key'
    ) THEN
        ALTER TABLE employee_permissions ADD CONSTRAINT employee_permissions_employee_id_key UNIQUE (employee_id);
    END IF;
END $$;
