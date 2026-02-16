-- SQL pour nettoyer les données liées à la fonctionnalité "Entretien"
-- Remet toutes les candidatures "interview" en "pending" pour ne pas les perdre
UPDATE public.recruitment_applications 
SET status = 'pending' 
WHERE status = 'interview';

-- Optionnel : Supprimer la contrainte de statut pour retirer 'interview' des valeurs autorisées
-- (Cela permet de revenir strictement à l'état précédent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'recruitment_applications_status_check') THEN
        ALTER TABLE public.recruitment_applications DROP CONSTRAINT recruitment_applications_status_check;
        
        ALTER TABLE public.recruitment_applications 
        ADD CONSTRAINT recruitment_applications_status_check 
        CHECK (status IN ('pending', 'accepted', 'rejected'));
    END IF;
END $$;
