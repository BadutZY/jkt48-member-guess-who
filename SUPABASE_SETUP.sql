CREATE TABLE IF NOT EXISTS public.rooms (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code                 TEXT UNIQUE NOT NULL,
  player1_id           TEXT NOT NULL,
  player1_name         TEXT NOT NULL,
  player1_secret       TEXT,
  player1_ready        BOOLEAN DEFAULT FALSE,
  player1_online       BOOLEAN DEFAULT FALSE,
  player2_id           TEXT,
  player2_name         TEXT,
  player2_secret       TEXT,
  player2_ready        BOOLEAN DEFAULT FALSE,
  player2_online       BOOLEAN DEFAULT FALSE,
  mode                 TEXT,
  status               TEXT DEFAULT 'waiting'
                         CHECK (status IN ('waiting','selecting','playing','finished')),
  countdown_started_at TIMESTAMPTZ,
  game_state           JSONB,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player1_online       BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS player2_online       BOOLEAN DEFAULT FALSE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS countdown_started_at TIMESTAMPTZ;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_rooms" ON public.rooms;
CREATE POLICY "allow_all_rooms" ON public.rooms
  FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

CREATE INDEX IF NOT EXISTS rooms_code_idx ON public.rooms (code);