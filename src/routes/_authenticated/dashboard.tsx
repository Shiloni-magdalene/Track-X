import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle, CalendarDays, GraduationCap, Loader2, Sparkles, Target, TrendingUp,
  Code2, Brain, Award, BookOpen,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Track-X" }] }),
  component: Dashboard,
});

function CircularProgress({ value, size = 96, stroke = 10, label }: {
  value: number; size?: number; stroke?: number; label?: string;
}) {
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--muted)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--primary)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} fill="none"
          className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tracking-tight">{value}%</span>
        {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

const cardHover = "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5";

function urgencyVariant(days: number) {
  if (days <= 2) return { label: "Urgent", className: "bg-destructive/15 text-destructive border-destructive/30" };
  if (days <= 7) return { label: "Soon", className: "bg-warning/15 text-warning-foreground border-warning/30" };
  return { label: "Upcoming", className: "bg-muted text-muted-foreground border-border" };
}

type StatRow = { label: string; icon: any; value: number | string; suffix?: string; hint: string };

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    academicProgress: 0,
    placementReadiness: 0,
    problemsSolved: 0,
    aptitudeAccuracy: 0,
    subjectCount: 0,
    projectCount: 0,
    certCount: 0,
  });
  const [upcomingExams, setUpcomingExams] = useState<Array<{ id: string; subject: string; type: string; date: string; daysLeft: number }>>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Array<{ id: string; name: string; daysLeft: number }>>([]);

  useEffect(() => {
    void (async () => {
      const [subjRes, examRes, projRes, leetRes, aptMockRes, certRes] = await Promise.all([
        supabase.from("subjects").select("*"),
        supabase.from("exams").select("*, subjects(name)"),
        supabase.from("projects").select("*"),
        supabase.from("leetcode").select("*"),
        supabase.from("aptitude_mocks").select("accuracy"),
        supabase.from("certificates").select("id"),
      ]);
      const subjects = subjRes.data ?? [];
      const exams = (examRes.data ?? []) as any[];
      const projects = projRes.data ?? [];
      const leet = leetRes.data ?? [];
      const mocks = aptMockRes.data ?? [];
      const certs = certRes.data ?? [];

      // Academic progress: average study_plan completion across subjects
      let academic = 0;
      if (subjects.length) {
        const perSubject = subjects.map((s: any) => {
          const sp: any[] = Array.isArray(s.study_plan) ? s.study_plan : [];
          const t = sp.reduce((a, x) => ({ studied: a.studied + (x.questionsStudied || 0), total: a.total + (x.totalQuestions || 0) }), { studied: 0, total: 0 });
          return t.total ? (t.studied / t.total) * 100 : 0;
        });
        academic = Math.round(perSubject.reduce((a, b) => a + b, 0) / perSubject.length);
      }

      // Placement readiness: (projects completed + certs) / target
      const completedProjects = projects.filter((p: any) => p.status === "completed").length;
      const placement = Math.min(100, Math.round(((completedProjects * 15) + (certs.length * 10) + (leet.length * 2)) / 1));

      // Aptitude accuracy from mocks
      const avgAcc = mocks.length ? Math.round(mocks.reduce((a: number, m: any) => a + (m.accuracy || 0), 0) / mocks.length) : 0;

      setStats({
        academicProgress: academic,
        placementReadiness: Math.min(100, placement),
        problemsSolved: leet.length,
        aptitudeAccuracy: avgAcc,
        subjectCount: subjects.length,
        projectCount: projects.length,
        certCount: certs.length,
      });

      const now = Date.now();
      const daysFrom = (d: string) => Math.ceil((new Date(d).getTime() - now) / (86400000));

      setUpcomingExams(
        exams
          .filter((e) => e.date && daysFrom(e.date) >= 0)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
          .map((e) => ({
            id: e.id,
            subject: e.subjects?.name || "Untitled",
            type: e.type,
            date: new Date(e.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
            daysLeft: daysFrom(e.date),
          })),
      );

      setUpcomingDeadlines(
        projects
          .filter((p: any) => p.deadline && daysFrom(p.deadline) >= 0 && p.status !== "completed")
          .sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          .slice(0, 5)
          .map((p: any) => ({ id: p.id, name: p.name, daysLeft: daysFrom(p.deadline) })),
      );

      setLoading(false);
    })();
  }, []);

  const isEmpty = !loading && stats.subjectCount === 0 && stats.projectCount === 0 && stats.problemsSolved === 0;

  if (loading) {
    return <div className="flex justify-center py-24 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <section className="rounded-2xl bg-gradient-brand p-6 text-primary-foreground shadow-glow sm:p-8">
        <p className="text-sm/6 opacity-80">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Your placement readiness starts today</h1>
        <p className="mt-2 max-w-2xl text-sm/6 opacity-90">
          Track academics, aptitude, projects, coding and placement prep — all in one workspace.
        </p>
      </section>

      {isEmpty && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center space-y-3">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">Your dashboard is ready for your data</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Start by adding a subject in Academics, a project in Projects, or a problem in the LeetCode tracker.
              Everything you enter shows up here.
            </p>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={cardHover}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Academic Progress</CardTitle>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><TrendingUp className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <CircularProgress value={stats.academicProgress} />
            <p className="text-xs text-muted-foreground">Across {stats.subjectCount} subjects</p>
          </CardContent>
        </Card>

        <Card className={cardHover}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Placement Readiness</CardTitle>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><Target className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <CircularProgress value={stats.placementReadiness} />
            <p className="text-xs text-muted-foreground">{stats.certCount} certs · {stats.projectCount} projects</p>
          </CardContent>
        </Card>

        <Card className={cardHover}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-success/15 text-success"><Code2 className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.problemsSolved}</div>
            <p className="mt-2 text-xs text-muted-foreground">LeetCode entries logged</p>
          </CardContent>
        </Card>

        <Card className={cardHover}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aptitude Accuracy</CardTitle>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-warning/20 text-warning-foreground"><Brain className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight">{stats.aptitudeAccuracy}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Average across mock tests</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className={cardHover}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-primary" /> Upcoming Deadlines</CardTitle>
            <CardDescription>Active projects with a due date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingDeadlines.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No upcoming deadlines.</p>
            ) : upcomingDeadlines.map((d, i) => {
              const u = urgencyVariant(d.daysLeft);
              return (
                <div key={d.id}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50 transition-colors">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><BookOpen className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">In {d.daysLeft} day{d.daysLeft === 1 ? "" : "s"}</p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", u.className)}>{u.label}</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className={cardHover}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> Upcoming Exams</CardTitle>
            <CardDescription>Next tests on your calendar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {upcomingExams.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No upcoming exams.</p>
            ) : upcomingExams.map((e, i) => {
              const u = urgencyVariant(e.daysLeft);
              return (
                <div key={e.id}>
                  {i > 0 && <Separator className="my-1" />}
                  <div className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50 transition-colors">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{e.subject}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{e.type}</Badge>
                        <span>{e.date}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 text-[10px]", u.className)}>{e.daysLeft}d</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
