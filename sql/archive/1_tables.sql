-- PARTIE 1 : TABLES ET STRUCTURE
-- Exécutez ce script en premier

-- 1. Table des Employés
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    iban TEXT,
    role TEXT NOT NULL CHECK (role IN ('mecano_confirme', 'mecano_junior', 'mecano_test', 'chef_atelier', 'patron', 'co_patron', 'responsable')),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    photo TEXT,
    custom_rate NUMERIC DEFAULT NULL,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Interventions (Factures / Sales)
CREATE TABLE IF NOT EXISTS public.sales (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE SET NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    vehicle_model TEXT NOT NULL,
    plate TEXT,
    service_type TEXT NOT NULL,
    contract_full_perf BOOLEAN DEFAULT false,
    contract_full_custom BOOLEAN DEFAULT false,
    price NUMERIC NOT NULL,
    invoice_url TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table de Pointage (Pointeuse)
CREATE TABLE IF NOT EXISTS public.time_entries (
    id TEXT PRIMARY KEY,
    employee_id TEXT REFERENCES public.employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    paused BOOLEAN DEFAULT false,
    pause_started TIMESTAMP WITH TIME ZONE,
    pause_total_ms NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Archives Hebdomadaires
CREATE TABLE IF NOT EXISTS public.weekly_archives (
    id TEXT PRIMARY KEY,
    total_revenue NUMERIC NOT NULL DEFAULT 0,
    total_sales_count INTEGER NOT NULL DEFAULT 0,
    period_label TEXT,
    total_payroll NUMERIC DEFAULT 0,
    payroll_details JSONB,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table de Configuration Paie
CREATE TABLE IF NOT EXISTS public.payroll_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    commission_rate NUMERIC NOT NULL DEFAULT 0.20,
    grade_rates JSONB NOT NULL DEFAULT '{"mecano_confirme": 0, "mecano_junior": 0, "mecano_test": 0, "chef_atelier": 0, "patron": 0, "co_patron": 0, "responsable": 0}'::jsonb,
    role_primes JSONB NOT NULL DEFAULT '{"mecano_confirme": 20, "mecano_junior": 20, "mecano_test": 5, "chef_atelier": 20, "patron": 60, "co_patron": 60, "responsable": 60}'::jsonb,
    company_split NUMERIC DEFAULT 0.60,
    safe_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Table Configuration Webhooks
CREATE TABLE IF NOT EXISTS public.webhook_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    sales_webhook_url TEXT DEFAULT '',
    services_webhook_url TEXT DEFAULT '',
    services_status_message_id TEXT DEFAULT '',
    recruitment_open BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table des Formations
CREATE TABLE IF NOT EXISTS public.training_courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    mandatory BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
