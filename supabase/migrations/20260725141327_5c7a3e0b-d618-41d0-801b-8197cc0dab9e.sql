
CREATE TABLE public.growth_progress (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_progress TO authenticated;
GRANT ALL ON public.growth_progress TO service_role;
ALTER TABLE public.growth_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own growth_progress" ON public.growth_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER growth_progress_updated_at BEFORE UPDATE ON public.growth_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.growth_completions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track TEXT NOT NULL,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quiz_score INTEGER,
  quiz_total INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track, completed_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_completions TO authenticated;
GRANT ALL ON public.growth_completions TO service_role;
ALTER TABLE public.growth_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own growth_completions" ON public.growth_completions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX growth_completions_user_date_idx ON public.growth_completions (user_id, completed_date DESC);
