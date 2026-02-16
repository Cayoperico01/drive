-- Ajout de la colonne pour stocker les infos de blocage directement dans la table employés
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS lock_details JSONB DEFAULT NULL;

-- (Optionnel) Copier les anciennes données de blocage si elles existent
-- Cette partie est "best effort" pour ne pas perdre les blocages actuels
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employee_permissions') THEN
        UPDATE employees e
        SET lock_details = p.permissions->'lock'
        FROM employee_permissions p
        WHERE e.id = p.employee_id 
        AND p.permissions ? 'lock';
    END IF;
END $$;
