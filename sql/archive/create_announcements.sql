-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Everyone can read announcements" ON public.announcements
    FOR SELECT USING (true);

-- Allow insert (we rely on app logic for role check 'patron')
CREATE POLICY "Patron can insert announcements" ON public.announcements
    FOR INSERT WITH CHECK (true);

-- Enable Realtime
alter publication supabase_realtime add table public.announcements;
