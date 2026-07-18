// Database types for the Student Academic & Placement Tracker.
// These mirror the Postgres schema — treat as the source of truth for
// domain shapes across the UI.

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  overall_academic_progress: number;
  overall_placement_readiness: number;
  ai_insights_cache: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudyPlanItem {
  topic: string;
  questionsStudied: number;
  totalQuestions: number;
}

export interface SubjectProject {
  componentsRequired?: string[];
  reportProgress?: number;
  deadline?: string;
  status?: "not_started" | "in_progress" | "submitted" | "graded";
}

export interface SubjectAssignment {
  progress?: number;
  deadline?: string;
  status?: "not_started" | "in_progress" | "submitted" | "graded";
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  credits: number;
  project: SubjectProject;
  assignment: SubjectAssignment;
  study_plan: StudyPlanItem[];
  created_at: string;
  updated_at: string;
}

export type ExamType = "CAT" | "Unit Test" | "Practical" | "EndSem";

export interface PracticalData {
  expCompletion?: number;
  recordStatus?: "pending" | "in_progress" | "complete";
  vivaPrep?: number;
}

export interface EndSemData {
  mockTests?: number;
  confidenceLevel?: number;
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string | null;
  type: ExamType;
  date: string | null;
  marks: number | null;
  target_marks: number | null;
  syllabus_covered: number;
  revision_percent: number;
  weak_topics: string[];
  practical_data: PracticalData;
  end_sem_data: EndSemData;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: "Technical" | string;
  learning_percent: number;
  hours_studied: number;
  projects_built: number;
  practice_questions: number;
  confidence: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export type AptitudeCategory = "Quant" | "Logical" | "Verbal";

export interface Aptitude {
  id: string;
  user_id: string;
  category: AptitudeCategory;
  topic: string;
  progress_percent: number;
  questions_solved: number;
  accuracy: number;
  time_per_question: number;
  weakness_level: "low" | "medium" | "high" | null;
  last_practiced: string | null;
  revision_due: string | null;
  difficulty: "easy" | "medium" | "hard" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AptitudeMock {
  id: string;
  user_id: string;
  date: string;
  total_score: number;
  quant_score: number;
  logical_score: number;
  verbal_score: number;
  accuracy: number;
  time_taken: number | null;
  mistakes: Array<{ topic: string; question?: string }>;
  improvement_suggestions: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeetcodeEntry {
  id: string;
  user_id: string;
  problem_name: string;
  topic: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  solved_date: string | null;
  revision_needed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: "planned" | "in_progress" | "completed" | "shipped";
  deadline: string | null;
  github_link: string | null;
  doc_progress: number;
  created_at: string;
  updated_at: string;
}

export interface LinkedinTracker {
  id: string;
  user_id: string;
  type: "Post" | "Certificate" | "Project";
  engagement: { likes?: number; comments?: number; shares?: number; views?: number };
  next_post_idea: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  name: string;
  platform: string | null;
  date: string | null;
  skills_learned: string[];
  resume_added: boolean;
  linkedin_posted: boolean;
  created_at: string;
  updated_at: string;
}
