-- Fix for: Unable to delete rows as one of them is currently referenced by a foreign key constraint from the table `payouts`
-- This script changes the foreign key behavior to ON DELETE CASCADE, 
-- allowing employee deletion to automatically remove their payout history.

ALTER TABLE public.payouts DROP CONSTRAINT IF EXISTS payouts_employee_id_fkey;

ALTER TABLE public.payouts
    ADD CONSTRAINT payouts_employee_id_fkey
    FOREIGN KEY (employee_id)
    REFERENCES public.employees(id)
    ON DELETE CASCADE;
