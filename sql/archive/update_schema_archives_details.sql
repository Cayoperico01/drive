-- Ajout de la colonne payroll_details pour stocker le détail des paiements par employé
-- Structure JSON attendue : 
-- [
--   {
--     "employeeId": "...",
--     "name": "Jean Dupont",
--     "role": "mecano",
--     "totalHours": 35.5,
--     "hourlyRate": 15,
--     "fixedSalary": 532.5,
--     "totalSales": 2000,
--     "commission": 400,
--     "totalDue": 932.5,
--     "paid": false
--   },
--   ...
-- ]

ALTER TABLE public.weekly_archives 
ADD COLUMN IF NOT EXISTS payroll_details JSONB DEFAULT '[]'::jsonb;
