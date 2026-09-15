import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import {
  Award,
  Check,
  Flame,
  Loader2,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TRACKS, levelFromXp, type QuizQuestion, type Track } from "@/lib/growth-content";
import { generateGrowthQuiz } from "@/lib/growth-ai.functions";

export const Route = createFileRoute("/_authenticated/daily-growth")({
  head: () => ({ meta: [{ title: "Daily Growth Hub — Aria" }] }),
  component: DailyGrowthHub,
});

type ProgressRow = {
  xp: number;
  streak: number;
  last_completed_date: string | null;
};

type Completion = { track: string; completed_date: string };
type Recommendation = { trackId: Track["id"]; reason: string };

const XP_PER_LESSON = 50;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

function DailyGrowthHub() {
  const [progress, setProgress] = useState<ProgressRow>({ xp: 0, streak: 0, last_completed_date: null });
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track["id"]>(TRACKS[0].id);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    const [prog, comps, exams, profile, leet] = await Promise.all([
      supabase.from("growth_progress" as never).select("*").eq("user_id", uid).maybeSingle(),
      supabase
        .from("growth_completions" as never)
        .select("track, completed_date")
        .eq("user_id", uid)
        .gte("completed_date", new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10)),
      supabase.from("exams").select("date").eq("user_id", uid).not("date", "is", null),
      supabase.from("profiles").select("overall_placement_readiness").eq("id", uid).maybeSingle(),
      supabase.from("leetcode").select("solved_date").eq("user_id", uid).order("solved_date", { ascending: false }).limit(1),
    ]);
    if (prog.data) setProgress(prog.data as unknown as ProgressRow);
    setCompletions(((comps.data as unknown) as Completion[]) ?? []);
    setRecommendation(computeRecommendation({
      exams: (exams.data ?? []) as Array<{ date: string | null }>,
      placementReadiness: (profile.data as { overall_placement_readiness?: number } | null)?.overall_placement_readiness ?? 0,
      lastLeetDate: (leet.data?.[0] as { solved_date?: string | null } | undefined)?.solved_date ?? null,
    }));
    setLoading(false);
  }

  const today = todayISO();
  const completedToday = useMemo(
    () => new Set(completions.filter((c) => c.completed_date === today).map((c) => c.track)),
    [completions, today],
  );
  const weeklyCount = useMemo(() => {
    const weekAgo = new Date(Date.now() - 6 * 86_400_000).toISOString().slice(0, 10);
    return new Set(completions.filter((c) => c.completed_date >= weekAgo).map((c) => `${c.track}-${c.completed_date}`))
      .size;
  }, [completions]);
  const weeklyGoal = 7; // one lesson a day
  const weeklyPct = Math.min(100, Math.round((weeklyCount / weeklyGoal) * 100));
  const level = levelFromXp(progress.xp);

  async function markCompleted(track: Track, score: { correct: number; total: number }) {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    if (completedToday.has(track.id)) {
      toast.info("Already completed today. Come back tomorrow!");
      return;
    }
    const { error: insErr } = await supabase.from("growth_completions" as never).insert({
      user_id: uid,
      track: track.id,
      completed_date: today,
      quiz_score: score.correct,
      quiz_total: score.total,
    } as never);
    if (insErr) {
      toast.error(insErr.message);
      return;
    }
    // streak logic
    let newStreak = 1;
    if (progress.last_completed_date) {
      const diff = daysBetween(progress.last_completed_date, today);
      if (diff === 0) newStreak = progress.streak; // already counted today
      else if (diff === 1) newStreak = progress.streak + 1;
      else newStreak = 1;
    }
    const newXp = progress.xp + XP_PER_LESSON;
    const { error: upErr } = await supabase
      .from("growth_progress" as never)
      .upsert(
        { user_id: uid, xp: newXp, streak: newStreak, last_completed_date: today } as never,
        { onConflict: "user_id" } as never,
      );
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    setProgress({ xp: newXp, streak: newStreak, last_completed_date: today });
    setCompletions((prev) => [...prev, { track: track.id, completed_date: today }]);
    toast.success(`+${XP_PER_LESSON} XP · ${newStreak}-day streak 🔥`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Daily Growth Hub"
        description="Tiny lessons, big compounding. 3–5 minutes a day."
        icon={<Star className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Daily Streak"
          value={`${progress.streak} day${progress.streak === 1 ? "" : "s"}`}
          hint={progress.last_completed_date ? `Last: ${progress.last_completed_date}` : "Start today"}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label="XP & Level"
          value={`${progress.xp} XP`}
          hint={level.title}
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Award className="h-4 w-4 text-primary" /> Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{weeklyPct}%</div>
            <Progress value={weeklyPct} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {weeklyCount}/{weeklyGoal} lessons this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendation banner */}
      {recommendation && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Today's smart pick</p>
                <p className="text-sm text-muted-foreground">{recommendation.reason}</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setActiveTrack(recommendation.trackId)}>
              Start recommended track
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tracks */}
      <Tabs value={activeTrack} onValueChange={(v) => setActiveTrack(v as Track["id"])}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/50 p-1">
          {TRACKS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs sm:text-sm">
              <span>{t.emoji}</span>
              <span className="hidden sm:inline">{t.title.split(" ")[0]}</span>
              {completedToday.has(t.id) && <Check className="h-3 w-3 text-emerald-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {TRACKS.map((t) => (
          <TabsContent key={t.id} value={t.id} className="mt-4">
            <LessonPanel
              track={t}
              completedToday={completedToday.has(t.id)}
              onComplete={(score) => markCompleted(t, score)}
              disabled={loading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon} {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function LessonPanel({
  track,
  completedToday,
  onComplete,
  disabled,
}: {
  track: Track;
  completedToday: boolean;
  onComplete: (score: { correct: number; total: number }) => void | Promise<void>;
  disabled: boolean;
}) {
  const genQuiz = useServerFn(generateGrowthQuiz);
  const [aiQuiz, setAiQuiz] = useState<QuizQuestion[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const quiz = aiQuiz ?? track.quiz;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setAiQuiz(null);
  }, [track.id]);

  const correctCount = Object.entries(answers).filter(
    ([i, v]) => quiz[Number(i)]?.answerIndex === v,
  ).length;

  async function runAiQuiz() {
    setAiLoading(true);
    try {
      const res = await genQuiz({ data: { trackId: track.id, trackTitle: track.title } });
      if (!res.questions.length) throw new Error("No quiz returned");
      setAiQuiz(res.questions);
      setAnswers({});
      setSubmitted(false);
      toast.success("Custom quiz ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{track.emoji}</span>
            <div>
              <CardTitle className="text-lg">{track.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{track.tagline}</p>
            </div>
          </div>
          {completedToday && (
            <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
              <Check className="mr-1 h-3 w-3" /> Completed today
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{track.lesson}</ReactMarkdown>
        </section>

        <section className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            💡 Practical example
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{track.example}</ReactMarkdown>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              ❓ Mini-quiz {aiQuiz ? <Badge variant="outline" className="ml-1">AI</Badge> : null}
            </h3>
            <Button size="sm" variant="outline" onClick={runAiQuiz} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Sparkles className="mr-1 h-3 w-3" />}
              AI Quiz Generator
            </Button>
          </div>

          <div className="space-y-4">
            {quiz.map((q, qi) => {
              const chosen = answers[qi];
              return (
                <div key={qi} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">
                    {qi + 1}. {q.question}
                  </p>
                  <div className="mt-2 grid gap-2">
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi;
                      const isCorrect = q.answerIndex === oi;
                      const showResult = submitted;
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => !submitted && setAnswers({ ...answers, [qi]: oi })}
                          disabled={submitted}
                          className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                            !showResult && isChosen && "border-primary bg-primary/5",
                            !showResult && !isChosen && "border-border hover:bg-accent",
                            showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
                            showResult && isChosen && !isCorrect && "border-rose-500 bg-rose-500/10",
                          )}
                        >
                          <span>{opt}</span>
                          {showResult && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                          {showResult && isChosen && !isCorrect && <X className="h-4 w-4 text-rose-600" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Why:</span> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            {submitted ? (
              <p className="text-sm">
                You got <span className="font-semibold">{correctCount}/{quiz.length}</span> right.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Answer all, then check.</p>
            )}
            <div className="flex gap-2">
              {!submitted ? (
                <Button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < quiz.length}
                >
                  Check answers
                </Button>
              ) : (
                <Button
                  onClick={() => onComplete({ correct: correctCount, total: quiz.length })}
                  disabled={disabled || completedToday}
                >
                  {completedToday ? "Completed today" : `Mark as completed · +${XP_PER_LESSON} XP`}
                </Button>
              )}
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}

function computeRecommendation(input: {
  exams: Array<{ date: string | null }>;
  placementReadiness: number;
  lastLeetDate: string | null;
}): Recommendation | null {
  const today = new Date();
  const upcomingExam = input.exams
    .map((e) => (e.date ? new Date(e.date) : null))
    .filter((d): d is Date => !!d && d.getTime() >= today.getTime())
    .sort((a, b) => a.getTime() - b.getTime())[0];
  if (upcomingExam) {
    const days = Math.ceil((upcomingExam.getTime() - today.getTime()) / 86_400_000);
    if (days <= 7)
      return {
        trackId: "biomed",
        reason: `You have an exam in ${days} day${days === 1 ? "" : "s"} — a Biomedical basics refresher will help most today.`,
      };
  }
  if (input.placementReadiness < 50) {
    return {
      trackId: "aptitude",
      reason: "Placement readiness is below 50%. Sharpen aptitude and communication first.",
    };
  }
  if (input.lastLeetDate) {
    const gap = Math.floor((today.getTime() - new Date(input.lastLeetDate).getTime()) / 86_400_000);
    if (gap >= 3)
      return {
        trackId: "coding",
        reason: `It's been ${gap} days since your last LeetCode solve — do a quick coding concept refresh.`,
      };
  } else {
    return {
      trackId: "coding",
      reason: "No LeetCode activity yet — start with a simple coding concept today.",
    };
  }
  return {
    trackId: "career",
    reason: "You're on track — grab a quick career tip to stay sharp.",
  };
}
