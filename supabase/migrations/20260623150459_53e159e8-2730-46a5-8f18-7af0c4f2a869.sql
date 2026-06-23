ALTER TABLE public.dewormings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Scheduled';

-- Ensure a reusable "Walk-in" owner exists for temporary walk-in pets
INSERT INTO public.owners (id, name, email)
VALUES ('00000000-0000-0000-0000-0000000000aa', 'Walk-in Clients', null)
ON CONFLICT (id) DO NOTHING;