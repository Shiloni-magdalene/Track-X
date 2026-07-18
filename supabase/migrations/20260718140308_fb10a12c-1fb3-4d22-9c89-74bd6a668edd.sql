
-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  overall_academic_progress numeric NOT NULL DEFAULT 0,
  overall_placement_readiness numeric NOT NULL DEFAULT 0,
  ai_insights_cache jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile delete" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUBJECTS ============
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  project jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignment jsonb NOT NULL DEFAULT '{}'::jsonb,
  study_plan jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own subjects" ON public.subjects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER subjects_set_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_subjects_user ON public.subjects(user_id);

-- ============ EXAMS ============
CREATE TABLE public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  type text NOT NULL,
  date date,
  marks numeric,
  target_marks numeric,
  syllabus_covered numeric NOT NULL DEFAULT 0,
  revision_percent numeric NOT NULL DEFAULT 0,
  weak_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  practical_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  end_sem_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT ALL ON public.exams TO service_role;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own exams" ON public.exams FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER exams_set_updated_at BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_exams_user ON public.exams(user_id);
CREATE INDEX idx_exams_subject ON public.exams(subject_id);

-- ============ SKILLS ============
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Technical',
  learning_percent numeric NOT NULL DEFAULT 0,
  hours_studied numeric NOT NULL DEFAULT 0,
  projects_built integer NOT NULL DEFAULT 0,
  practice_questions integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own skills" ON public.skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER skills_set_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_skills_user ON public.skills(user_id);

-- ============ APTITUDE ============
CREATE TABLE public.aptitude (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  topic text NOT NULL,
  progress_percent numeric NOT NULL DEFAULT 0,
  questions_solved integer NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  time_per_question numeric NOT NULL DEFAULT 0,
  weakness_level text,
  last_practiced timestamptz,
  revision_due date,
  difficulty text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aptitude TO authenticated;
GRANT ALL ON public.aptitude TO service_role;
ALTER TABLE public.aptitude ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own aptitude" ON public.aptitude FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER aptitude_set_updated_at BEFORE UPDATE ON public.aptitude FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_aptitude_user ON public.aptitude(user_id);

-- ============ APTITUDE MOCKS ============
CREATE TABLE public.aptitude_mocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_score numeric NOT NULL DEFAULT 0,
  quant_score numeric NOT NULL DEFAULT 0,
  logical_score numeric NOT NULL DEFAULT 0,
  verbal_score numeric NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  time_taken numeric,
  mistakes jsonb NOT NULL DEFAULT '[]'::jsonb,
  improvement_suggestions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aptitude_mocks TO authenticated;
GRANT ALL ON public.aptitude_mocks TO service_role;
ALTER TABLE public.aptitude_mocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own aptitude mocks" ON public.aptitude_mocks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER aptitude_mocks_set_updated_at BEFORE UPDATE ON public.aptitude_mocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_aptitude_mocks_user ON public.aptitude_mocks(user_id);

-- ============ LEETCODE ============
CREATE TABLE public.leetcode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_name text NOT NULL,
  topic text,
  difficulty text,
  solved_date date,
  revision_needed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leetcode TO authenticated;
GRANT ALL ON public.leetcode TO service_role;
ALTER TABLE public.leetcode ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own leetcode" ON public.leetcode FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER leetcode_set_updated_at BEFORE UPDATE ON public.leetcode FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_leetcode_user ON public.leetcode(user_id);

-- ============ PROJECTS ============
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  deadline date,
  github_link text,
  doc_progress numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_projects_user ON public.projects(user_id);

-- ============ LINKEDIN TRACKER ============
CREATE TABLE public.linkedin_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  engagement jsonb NOT NULL DEFAULT '{}'::jsonb,
  next_post_idea text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.linkedin_tracker TO authenticated;
GRANT ALL ON public.linkedin_tracker TO service_role;
ALTER TABLE public.linkedin_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own linkedin" ON public.linkedin_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER linkedin_set_updated_at BEFORE UPDATE ON public.linkedin_tracker FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_linkedin_user ON public.linkedin_tracker(user_id);

-- ============ CERTIFICATES ============
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  platform text,
  date date,
  skills_learned jsonb NOT NULL DEFAULT '[]'::jsonb,
  resume_added boolean NOT NULL DEFAULT false,
  linkedin_posted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own certificates" ON public.certificates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER certificates_set_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
